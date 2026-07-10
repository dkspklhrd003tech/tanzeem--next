import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  pages,
  audio,
  videos,
  books,
  teamMembers,
  activityLogs,
  users,
  pressReleases,
  audioBooks,
  homeCampaigns,
  locations,
  magazines,
} from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Query counts
        const [
            pagesCount,
            audioCount,
            videosCount,
            booksCount,
            teamCount,
            pressCount,
            campaignsCount,
            locationsCount,
            magazinesCount,
            audioBooksCount,
            monthlyViews,
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(pages),
            db.select({ count: sql<number>`count(*)` }).from(audio),
            db.select({ count: sql<number>`count(*)` }).from(videos),
            db.select({ count: sql<number>`count(*)` }).from(books),
            db.select({ count: sql<number>`count(*)` }).from(teamMembers),
            db.select({ count: sql<number>`count(*)` }).from(pressReleases),
            db.select({ count: sql<number>`count(*)` }).from(homeCampaigns),
            db.select({ count: sql<number>`count(*)` }).from(locations),
            db.select({ count: sql<number>`count(*)` }).from(magazines),
            db.select({ count: sql<number>`count(*)` }).from(audioBooks),
            db.select({ count: sql<number>`coalesce(sum(view_count), 0)` }).from(videos),
        ]);

        // Get recent activity
        const recentActivityRaw = await db
            .select({
                id: activityLogs.id,
                action: activityLogs.action,
                entityType: activityLogs.entityType,
                details: activityLogs.details,
                createdAt: activityLogs.createdAt,
                userName: users.name
            })
            .from(activityLogs)
            .leftJoin(users, eq(activityLogs.userId, users.id))
            .orderBy(desc(activityLogs.createdAt))
            .limit(5);

        // If no activity logs exist, let's provide some dummy data based on recently added items just so the dashboard isn't completely empty initially
        let recentActivity = recentActivityRaw.map(log => ({
            action: log.action,
            item: log.details || `${log.entityType} updated`,
            time: log.createdAt,
            type: log.entityType.toLowerCase()
        }));

        if (recentActivity.length === 0) {
            const recentPages = await db.select({ title: pages.title, createdAt: pages.createdAt }).from(pages).orderBy(desc(pages.createdAt)).limit(3);
            recentActivity = recentPages.map(p => ({
                action: "Page Add / Update",
                item: p.title,
                time: p.createdAt,
                type: "page"
            }));
        }

        return NextResponse.json({
            stats: {
                pages: pagesCount[0].count,
                audio: audioCount[0].count,
                videos: videosCount[0].count,
                books: booksCount[0].count,
                team: teamCount[0].count,
                pressReleases: pressCount[0].count,
                audioBooks: audioBooksCount[0].count,
                campaigns: campaignsCount[0].count,
                locations: locationsCount[0].count,
                magazines: magazinesCount[0].count,
                views: `${Math.round(Number(monthlyViews[0].count) / 1000)}K`,
            },
            recentActivity
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
