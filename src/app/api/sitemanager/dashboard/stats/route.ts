import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pages,
  audio,
  audioCategories,
  videos,
  videoCategories,
  books,
  bookCategories,
  magazines,
  sermons,
  pressReleases,
  teamMembers,
  homeCampaigns,
  locations,
  media,
  formSubmissions,
} from "@/db/schema";
import { sql, desc, eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Top-level counts (run in parallel) ───────────────────────────────────
    const [
      pagesCount,
      audioCount,
      videosCount,
      booksCount,
      magazinesCount,
      sermonsCount,
      sermonsPublished,
      pressCount,
      teamCount,
      campaignsCount,
      locationsCount,
      mediaCount,
      unreadMessages,
      // engagement totals
      audioPlayTotal,
      audioDownloadTotal,
      videoViewTotal,
      bookDownloadTotal,
      magazineDownloadTotal,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(pages),
      db.select({ count: sql<number>`count(*)` }).from(audio),
      db.select({ count: sql<number>`count(*)` }).from(videos),
      db.select({ count: sql<number>`count(*)` }).from(books),
      db.select({ count: sql<number>`count(*)` }).from(magazines),
      db.select({ count: sql<number>`count(*)` }).from(sermons),
      db.select({ count: sql<number>`count(*)` }).from(sermons).where(eq(sermons.isPublished, true)),
      db.select({ count: sql<number>`count(*)` }).from(pressReleases),
      db.select({ count: sql<number>`count(*)` }).from(teamMembers),
      db.select({ count: sql<number>`count(*)` }).from(homeCampaigns),
      db.select({ count: sql<number>`count(*)` }).from(locations),
      db.select({ count: sql<number>`count(*)` }).from(media),
      db
        .select({ count: sql<number>`count(*)` })
        .from(formSubmissions)
        .where(eq(formSubmissions.isRead, false)),
      db.select({ total: sql<number>`coalesce(sum(play_count), 0)` }).from(audio),
      db.select({ total: sql<number>`coalesce(sum(download_count), 0)` }).from(audio),
      db.select({ total: sql<number>`coalesce(sum(view_count), 0)` }).from(videos),
      db.select({ total: sql<number>`coalesce(sum(download_count), 0)` }).from(books),
      db.select({ total: sql<number>`coalesce(sum(download_count), 0)` }).from(magazines),
    ]);

    // ── Audio sub-categories ─────────────────────────────────────────────────
    const audioByCategoryRaw = await db
      .select({
        categoryId: audio.categoryId,
        categoryName: audioCategories.name,
        count: sql<number>`count(*)`,
        plays: sql<number>`coalesce(sum(${audio.playCount}), 0)`,
        downloads: sql<number>`coalesce(sum(${audio.downloadCount}), 0)`,
      })
      .from(audio)
      .leftJoin(audioCategories, eq(audio.categoryId, audioCategories.id))
      .groupBy(audio.categoryId, audioCategories.name)
      .orderBy(sql`count(*) desc`);

    const audioByCategory = audioByCategoryRaw.map((r) => ({
      category: r.categoryName ?? "Uncategorized",
      count: Number(r.count),
      plays: Number(r.plays),
      downloads: Number(r.downloads),
    }));

    // ── Book sub-categories ──────────────────────────────────────────────────
    const booksByCategoryRaw = await db
      .select({
        categoryId: books.categoryId,
        categoryName: bookCategories.name,
        count: sql<number>`count(*)`,
        downloads: sql<number>`coalesce(sum(${books.downloadCount}), 0)`,
      })
      .from(books)
      .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id))
      .groupBy(books.categoryId, bookCategories.name)
      .orderBy(sql`count(*) desc`);

    const booksByCategory = booksByCategoryRaw.map((r) => ({
      category: r.categoryName ?? "Uncategorized",
      count: Number(r.count),
      downloads: Number(r.downloads),
    }));

    // ── Magazine sub-categories (by year) ────────────────────────────────────
    const magazinesByYearRaw = await db
      .select({
        year: sql<number>`year(${magazines.createdAt})`,
        count: sql<number>`count(*)`,
        downloads: sql<number>`coalesce(sum(${magazines.downloadCount}), 0)`,
      })
      .from(magazines)
      .groupBy(sql`year(${magazines.createdAt})`)
      .orderBy(sql`year(${magazines.createdAt}) desc`);

    const magazinesByYear = magazinesByYearRaw.map((r) => ({
      year: r.year ?? "Unknown",
      count: Number(r.count),
      downloads: Number(r.downloads),
    }));

    // ── Media breakdown by MIME type group ───────────────────────────────────
    const mediaByTypeRaw = await db
      .select({
        mimeGroup: sql<string>`
          case
            when mime_type like 'image/%' then 'Images'
            when mime_type like 'video/%' then 'Videos'
            when mime_type like 'audio/%' then 'Audio'
            when mime_type like 'application/pdf' then 'PDFs'
            when mime_type like 'application/%' then 'Documents'
            else 'Other'
          end
        `,
        count: sql<number>`count(*)`,
        totalSize: sql<number>`coalesce(sum(size), 0)`,
      })
      .from(media)
      .groupBy(
        sql`case
          when mime_type like 'image/%' then 'Images'
          when mime_type like 'video/%' then 'Videos'
          when mime_type like 'audio/%' then 'Audio'
          when mime_type like 'application/pdf' then 'PDFs'
          when mime_type like 'application/%' then 'Documents'
          else 'Other'
        end`
      )
      .orderBy(sql`count(*) desc`);

    const mediaByType = mediaByTypeRaw.map((r) => ({
      type: r.mimeGroup,
      count: Number(r.count),
      totalSizeMB: Math.round(Number(r.totalSize) / 1024 / 1024),
    }));

    // ── Last 5 edited pages ───────────────────────────────────────────────────
    const recentPages = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        isPublished: pages.isPublished,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .orderBy(desc(pages.updatedAt))
      .limit(5);

    const totalResources =
      Number(audioCount[0]?.count ?? 0) +
      Number(videosCount[0]?.count ?? 0) +
      Number(booksCount[0]?.count ?? 0) +
      Number(magazinesCount[0]?.count ?? 0) +
      Number(sermonsCount[0]?.count ?? 0);

    return NextResponse.json({
      stats: {
        pages: Number(pagesCount[0]?.count ?? 0),
        audio: Number(audioCount[0]?.count ?? 0),
        videos: Number(videosCount[0]?.count ?? 0),
        books: Number(booksCount[0]?.count ?? 0),
        magazines: Number(magazinesCount[0]?.count ?? 0),
        sermons: Number(sermonsCount[0]?.count ?? 0),
        sermonsPublished: Number(sermonsPublished[0]?.count ?? 0),
        pressReleases: Number(pressCount[0]?.count ?? 0),
        team: Number(teamCount[0]?.count ?? 0),
        campaigns: Number(campaignsCount[0]?.count ?? 0),
        locations: Number(locationsCount[0]?.count ?? 0),
        media: Number(mediaCount[0]?.count ?? 0),
        unreadMessages: Number(unreadMessages[0]?.count ?? 0),
        totalResources,
        // engagement
        audioPlays: Number(audioPlayTotal[0]?.total ?? 0),
        audioDownloads: Number(audioDownloadTotal[0]?.total ?? 0),
        videoViews: Number(videoViewTotal[0]?.total ?? 0),
        bookDownloads: Number(bookDownloadTotal[0]?.total ?? 0),
        magazineDownloads: Number(magazineDownloadTotal[0]?.total ?? 0),
      },
      // sub-category breakdowns
      audioByCategory,
      booksByCategory,
      magazinesByYear,
      mediaByType,
      recentPages,
    });
  } catch (error) {
    console.error("Sitemanager stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
