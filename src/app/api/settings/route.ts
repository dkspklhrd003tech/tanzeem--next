import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings, activityLogs } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET - Get all settings
export async function GET() {
  try {
    const settingsData = await db.select().from(settings).orderBy(asc(settings.group));

    // Transform to key-value object
    const settingsObj: Record<string, Record<string, string>> = {};

    for (const setting of settingsData) {
      if (!settingsObj[setting.group]) {
        settingsObj[setting.group] = {};
      }
      settingsObj[setting.group][setting.key] = setting.value;
    }

    return NextResponse.json({ settings: settingsObj, raw: settingsData });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Support both flat object and { settings, group } format
    const settingsToUpdate = body.settings || body;
    const targetGroup = body.group;
    
    const results: any[] = [];

    for (const [key, value] of Object.entries(settingsToUpdate)) {
      const typeStr = typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "text";
      const valueStr = String(value);

      // Try to find existing setting to preserve group if not explicitly provided
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      const groupToUse = targetGroup || (existing.length ? existing[0].group : "general");

      await db.insert(settings)
        .values({
          id: crypto.randomUUID(),
          key,
          value: valueStr,
          type: typeStr,
          group: groupToUse,
        })
        .onDuplicateKeyUpdate({
          set: {
            value: valueStr,
            type: typeStr,
            group: groupToUse,
          }
        });

      const updatedSetting = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (updatedSetting.length) results.push(updatedSetting[0]);
    }

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "update",
      entityType: "settings",
      details: JSON.stringify({ keys: Object.keys(settingsToUpdate) }),
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, settings: results });
  } catch (error: any) {
    console.error("DEBUG: Update settings error:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
