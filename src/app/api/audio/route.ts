import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audio, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, like, desc, count, and } from "drizzle-orm";

// GET - List all audio
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

    if (published === "true") conditions.push(eq(audio.isPublished, true));
    else if (published === "false") conditions.push(eq(audio.isPublished, false));

    if (categoryId) conditions.push(eq(audio.categoryId, categoryId));
    if (speakerId) conditions.push(eq(audio.speakerId, speakerId));
    if (featured === "true") conditions.push(eq(audio.isFeatured, true));

    if (search) {
      conditions.push(
        or(
          like(audio.title, `%${search}%`),
          like(audio.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [audioData, totalResult] = await Promise.all([
      db.query.audio.findMany({
        where: whereClause,
        with: {
          category: true,
          speaker: true,
          author: { columns: { id: true, name: true, email: true } },
        },
        orderBy: [desc(audio.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: count() }).from(audio).where(whereClause),
    ]);

    return NextResponse.json({ audio: audioData, total: totalResult[0].count });
  } catch (error) {
    console.error("Get audio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new audio
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.slug || !data.audioUrl) {
      return NextResponse.json(
        { error: "Title, slug, and audio URL are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingAudio = await db.query.audio.findFirst({
      where: eq(audio.slug, data.slug),
    });

    if (existingAudio) {
      return NextResponse.json(
        { error: "An audio file with this slug already exists" },
        { status: 400 }
      );
    }

    const audioId = crypto.randomUUID();

    await db.insert(audio).values({
      id: audioId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      audioUrl: data.audioUrl,
      duration: data.duration,
      fileSize: data.fileSize,
      thumbnailUrl: data.thumbnailUrl,
      categoryId: data.categoryId,
      speakerId: data.speakerId,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      authorId: user.id,
      publishedAt: data.isPublished ? new Date() : null,
    });

    const newAudio = await db.query.audio.findFirst({
      where: eq(audio.id, audioId),
      with: {
        category: true,
        speaker: true,
      },
    });

    // Log activity
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "create",
      entityType: "audio",
      entityId: audioId,
      details: JSON.stringify({ title: data.title }),
    });

    return NextResponse.json({ audio: newAudio }, { status: 201 });
  } catch (error) {
    console.error("Create audio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
