import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { videos, videoCategories, speakers, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, like, desc, count, and, asc, leftJoin } from "drizzle-orm";

// ─── shared helper ────────────────────────────────────────────────────────────
// Builds a plain object from a joined row, matching the shape the frontend expects.
function mapVideoRow(row: {
  videos: typeof videos.$inferSelect;
  videoCategories: typeof videoCategories.$inferSelect | null;
  speakers: typeof speakers.$inferSelect | null;
}) {
  return {
    ...row.videos,
    category: row.videoCategories ?? null,
    speaker: row.speakers ?? null,
  };
}

// GET - List all videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const categoryId = searchParams.get("categoryId");
    const speakerId = searchParams.get("speakerId");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const conditions: any[] = [];

    if (published === "true") conditions.push(eq(videos.isPublished, true));
    if (published === "false") conditions.push(eq(videos.isPublished, false));
    if (categoryId) conditions.push(eq(videos.categoryId, categoryId));
    if (speakerId) conditions.push(eq(videos.speakerId, speakerId));
    if (featured === "true") conditions.push(eq(videos.isFeatured, true));
    if (search) {
      conditions.push(
        or(
          like(videos.title, `%${search}%`),
          like(videos.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Use explicit left joins instead of db.query relational `with` to avoid
    // Drizzle mode:"default" lateral-join alias bug (videos_category / videos_speaker).
    const [videosData, totalResult] = await Promise.all([
      db
        .select()
        .from(videos)
        .leftJoin(videoCategories, eq(videos.categoryId, videoCategories.id))
        .leftJoin(speakers, eq(videos.speakerId, speakers.id))
        .where(whereClause)
        .orderBy(asc(videos.order), desc(videos.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(videos).where(whereClause),
    ]);

    return NextResponse.json({
      videos: videosData.map(mapVideoRow),
      total: totalResult[0].count,
    });
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create video
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }
    if (!data.videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    const videoId = crypto.randomUUID();

    let finalSlug = data.slug;
    const existingSlug = await db
      .select({ id: videos.id })
      .from(videos)
      .where(eq(videos.slug, finalSlug))
      .limit(1);

    if (existingSlug.length > 0) {
      finalSlug = `${finalSlug}-${crypto.randomUUID().split("-")[0]}`;
    }

    await db.insert(videos).values({
      id: videoId,
      title: data.title,
      slug: finalSlug,
      description: data.description,
      videoUrl: data.videoUrl,
      embedUrl: data.embedUrl,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      categoryId: data.categoryId,
      speakerId: data.speakerId,
      episodeNumber: data.episodeNumber,
      eventLocation: data.eventLocation,
      tags: data.tags,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      authorId: user.id,
      publishedAt: data.isPublished ? new Date() : null,
    });

    // Re-fetch with explicit joins — avoids the lateral-join alias bug
    const rows = await db
      .select()
      .from(videos)
      .leftJoin(videoCategories, eq(videos.categoryId, videoCategories.id))
      .leftJoin(speakers, eq(videos.speakerId, speakers.id))
      .where(eq(videos.id, videoId))
      .limit(1);

    const newVideo = rows.length > 0 ? mapVideoRow(rows[0]) : null;

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "create",
      entityType: "video",
      entityId: videoId,
      details: JSON.stringify({ title: data.title }),
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ video: newVideo }, { status: 201 });
  } catch (error: any) {
    console.error("Create video error:", error);
    revalidatePath("/", "layout");
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH - Reorder videos
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      revalidatePath("/", "layout");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orders } = body; // Expected: [{ id: string, order: number }, ...]

    if (!orders || !Array.isArray(orders)) {
      revalidatePath("/", "layout");
      return NextResponse.json({ error: "Invalid orders data" }, { status: 400 });
    }

    // Multiple updates in a transaction
    await db.transaction(async (tx) => {
      for (const item of orders) {
        await tx.update(videos).set({ order: item.order }).where(eq(videos.id, item.id));
      }
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, message: "Videos reordered successfully" });
  } catch (error) {
    console.error("Patch videos error:", error);
    revalidatePath("/", "layout");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
