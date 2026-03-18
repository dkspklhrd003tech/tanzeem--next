import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, like, desc, count, and } from "drizzle-orm";

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

    const [videosData, totalResult] = await Promise.all([
      db.query.videos.findMany({
        where: whereClause,
        with: {
          category: true,
          speaker: true,
          author: { columns: { id: true, name: true } },
        },
        orderBy: [videos.order, desc(videos.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: count() }).from(videos).where(whereClause),
    ]);

    return NextResponse.json({ videos: videosData, total: totalResult[0].count });
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create video
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const videoId = crypto.randomUUID();

    await db.insert(videos).values({
      id: videoId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      videoUrl: data.videoUrl,
      embedUrl: data.embedUrl,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      categoryId: data.categoryId,
      speakerId: data.speakerId,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      authorId: user.id,
      publishedAt: data.isPublished ? new Date() : null,
    });

    const newVideo = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
      with: { category: true, speaker: true },
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "create",
      entityType: "video",
      entityId: videoId,
      details: JSON.stringify({ title: data.title }),
    });

    return NextResponse.json({ video: newVideo }, { status: 201 });
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { orders } = body; // Expected: [{ id: string, order: number }, ...]

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid orders data" }, { status: 400 });
        }

        // Multiple updates in a transaction
        await db.transaction(async (tx) => {
            for (const item of orders) {
                await tx.update(videos).set({ order: item.order }).where(eq(videos.id, item.id));
            }
        });

        return NextResponse.json({ success: true, message: "Videos reordered successfully" });
    } catch (error) {
        console.error("Patch videos error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
