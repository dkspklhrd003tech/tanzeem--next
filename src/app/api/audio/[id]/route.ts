import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audio, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

// GET - Get single audio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const audioData = await db.query.audio.findFirst({
      where: eq(audio.id, id),
      with: {
        category: true,
        speaker: true,
        author: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!audioData) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    // Increment play count
    await db.update(audio)
      .set({ playCount: sql`${audio.playCount} + 1` })
      .where(eq(audio.id, id));

    return NextResponse.json({ audio: audioData });
  } catch (error) {
    console.error("Get audio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update audio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const existingAudio = await db.query.audio.findFirst({
      where: eq(audio.id, id),
    });

    if (!existingAudio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    // Check if new slug conflicts
    if (data.slug && data.slug !== existingAudio.slug) {
      const slugConflict = await db.query.audio.findFirst({
        where: eq(audio.slug, data.slug),
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: "An audio file with this slug already exists" },
          { status: 400 }
        );
      }
    }

    await db.update(audio).set({
      title: data.title,
      slug: data.slug,
      description: data.description,
      audioUrl: data.audioUrl,
      duration: data.duration,
      fileSize: data.fileSize,
      thumbnailUrl: data.thumbnailUrl,
      categoryId: data.categoryId,
      speakerId: data.speakerId,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      publishedAt: data.isPublished && !existingAudio.isPublished
        ? new Date()
        : existingAudio.publishedAt,
    }).where(eq(audio.id, id));

    const updatedAudio = await db.query.audio.findFirst({
      where: eq(audio.id, id),
      with: {
        category: true,
        speaker: true,
      },
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "update",
      entityType: "audio",
      entityId: id,
      details: JSON.stringify({ title: updatedAudio?.title }),
    });

    return NextResponse.json({ audio: updatedAudio });
  } catch (error) {
    console.error("Update audio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete audio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingAudio = await db.query.audio.findFirst({
      where: eq(audio.id, id),
    });

    if (!existingAudio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    await db.delete(audio).where(eq(audio.id, id));

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "delete",
      entityType: "audio",
      entityId: id,
      details: JSON.stringify({ title: existingAudio.title }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete audio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
