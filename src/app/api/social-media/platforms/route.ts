import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { socialPlatforms, activityLogs } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// GET - Get all platforms
export async function GET() {
  try {
    const data = await db.select().from(socialPlatforms).orderBy(asc(socialPlatforms.order));
    return NextResponse.json({ success: true, platforms: data });
  } catch (error) {
    console.error("Get social platforms error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create or Update platforms
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platforms } = await request.json();
    if (!Array.isArray(platforms)) {
      return NextResponse.json({ error: "Invalid payload: platforms must be an array" }, { status: 400 });
    }

    const results = [];

    for (const platform of platforms) {
      const id = platform.id || crypto.randomUUID();
      
      const payload = {
        id,
        name: platform.name,
        slug: platform.slug,
        iconUrl: platform.iconUrl,
        themeColor: platform.themeColor,
        order: platform.order || 0,
        isActive: platform.isActive !== undefined ? platform.isActive : true,
      };

      await db.insert(socialPlatforms)
        .values(payload)
        .onDuplicateKeyUpdate({
          set: {
            name: platform.name,
            slug: platform.slug,
            iconUrl: platform.iconUrl,
            themeColor: platform.themeColor,
            order: platform.order || 0,
            isActive: platform.isActive !== undefined ? platform.isActive : true,
          }
        });

      results.push(payload);
    }

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "update",
      entityType: "social_platforms",
      details: JSON.stringify({ count: platforms.length }),
    });

    return NextResponse.json({ success: true, platforms: results });
  } catch (error: any) {
    console.error("Update social platforms error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a platform
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing platform ID" }, { status: 400 });
    }

    await db.delete(socialPlatforms).where(eq(socialPlatforms.id, id));

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "delete",
      entityType: "social_platforms",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Platform deleted" });
  } catch (error: any) {
    console.error("Delete social platform error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
