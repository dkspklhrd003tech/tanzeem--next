import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const isUnlimited = limitParam === "unlimited" || limitParam === "0" || limitParam === "all";
    const limit = isUnlimited ? null : Math.max(1, parseInt(limitParam ?? "10") || 10);

    let query = db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        details: activityLogs.details,
        ipAddress: activityLogs.ipAddress,
        createdAt: activityLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatar,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt));

    const logs = isUnlimited || limit === null ? await query : await query.limit(limit);

    const formattedLogs = logs.map((log) => {
      let badgeBg = null;
      let badgeText = null;
      if (log.userAvatar && log.userAvatar.startsWith("{")) {
        try {
          const parsed = JSON.parse(log.userAvatar);
          badgeBg = parsed.badgeBg || null;
          badgeText = parsed.badgeText || null;
        } catch (e) {}
      }
      return {
        ...log,
        badgeBg,
        badgeText,
      };
    });

    return NextResponse.json({ activity: formattedLogs });
  } catch (error) {
    console.error("Activity log fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
