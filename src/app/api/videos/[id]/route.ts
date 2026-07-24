import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { videos, videoCategories, speakers, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET - Single video by ID (uses explicit joins to avoid Drizzle mode:"default" lateral alias bug)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const rows = await db
            .select()
            .from(videos)
            .leftJoin(videoCategories, eq(videos.categoryId, videoCategories.id))
            .leftJoin(speakers, eq(videos.speakerId, speakers.id))
            .where(eq(videos.id, id))
            .limit(1);

        if (rows.length === 0) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const row = rows[0];
        const video = {
            ...row.videos,
            category: row.video_categories ?? null,
            speaker: row.speakers ?? null,
        };

        return NextResponse.json({ video });
    } catch (error) {
        console.error("Get video error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Update video
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            revalidatePath("/", "layout");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        const existing = await db
            .select()
            .from(videos)
            .where(eq(videos.id, id))
            .limit(1);

        if (existing.length === 0) {
            revalidatePath("/", "layout");
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const current = existing[0];

        await db.update(videos).set({
            title: data.title ?? current.title,
            slug: data.slug ?? current.slug,
            description: data.description ?? current.description,
            videoUrl: data.videoUrl ?? current.videoUrl,
            embedUrl: data.embedUrl ?? current.embedUrl,
            thumbnailUrl: data.thumbnailUrl ?? current.thumbnailUrl,
            duration: data.duration ?? current.duration,
            categoryId: data.categoryId ?? current.categoryId,
            speakerId: data.speakerId ?? current.speakerId,
            isPublished: data.isPublished ?? current.isPublished,
            isFeatured: data.isFeatured ?? current.isFeatured,
            metaTitle: data.metaTitle ?? current.metaTitle,
            metaDescription: data.metaDescription ?? current.metaDescription,
            order: data.order ?? current.order,
            updatedAt: new Date(),
        }).where(eq(videos.id, id));

        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "update",
            entityType: "video",
            entityId: id,
            details: JSON.stringify({ title: data.title || current.title }),
        });

        revalidatePath("/", "layout");
        return NextResponse.json({ message: "Video updated successfully" });
    } catch (error: any) {
        console.error("Update video error:", error);
        revalidatePath("/", "layout");
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
    }
}

// DELETE - Remove video
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            revalidatePath("/", "layout");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await db
            .select()
            .from(videos)
            .where(eq(videos.id, id))
            .limit(1);

        if (existing.length === 0) {
            revalidatePath("/", "layout");
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const current = existing[0];

        await db.delete(videos).where(eq(videos.id, id));

        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "delete",
            entityType: "video",
            entityId: id,
            details: JSON.stringify({ title: current.title }),
        });

        revalidatePath("/", "layout");
        return NextResponse.json({ message: "Video deleted successfully" });
    } catch (error: any) {
        console.error("Delete video error:", error);
        revalidatePath("/", "layout");
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
    }
}
