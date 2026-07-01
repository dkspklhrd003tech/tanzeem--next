import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, pages, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request as any);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch recent activity logs
    const activities = await db.query.activityLogs.findMany({
      with: {
        user: true,
      },
      orderBy: [desc(activityLogs.createdAt)],
      limit: 10,
    });

    // Fetch recent edited pages
    const recentPages = await db.query.pages.findMany({
      orderBy: [desc(pages.updatedAt)],
      limit: 5,
    });

    // Generate mock traffic data for the last 7 days
    const trafficData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trafficData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 500) + 100,
        visitors: Math.floor(Math.random() * 300) + 50,
      });
    }

    return NextResponse.json({
      activities,
      recentPages,
      trafficData
    });
  } catch (error) {
    console.error("Failed to fetch activity data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
