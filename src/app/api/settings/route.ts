import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings, activityLogs } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

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

    const data = await request.json();
    const results: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      const typeStr = typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "text";
      const valueStr = String(value);

      // Generating a simple UUID fallback since settings id is required
      const id = crypto.randomUUID();

      await db.insert(settings)
        .values({
          id,
          key,
          value: valueStr,
          type: typeStr,
          group: "general",
        })
        .onDuplicateKeyUpdate({
          set: {
            value: valueStr,
            type: typeStr,
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
      details: JSON.stringify({ keys: Object.keys(data) }),
    });

    return NextResponse.json({ success: true, settings: results });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
