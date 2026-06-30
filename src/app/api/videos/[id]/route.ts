import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { videos, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const video = await db.query.videos.findFirst({
            where: eq(videos.id, resolvedParams.id),
            with: { category: true, speaker: true, author: { columns: { id: true, name: true } } },
        });

    return NextResponse.json({ error: "Video not found" }, { status: 404 });

    return NextResponse.json({ video });
    } catch (error) {
        console.error("Get video error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) revalidatePath("/", "layout");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;
        const data = await request.json();

        const existing = await db.query.videos.findFirst({
            where: eq(videos.id, resolvedParams.id),
        });

        if (!existing) revalidatePath("/", "layout");
    return NextResponse.json({ error: "Video not found" }, { status: 404 });

        await db.update(videos).set({
            title: data.title ?? existing.title,
            slug: data.slug ?? existing.slug,
            description: data.description ?? existing.description,
            videoUrl: data.videoUrl ?? existing.videoUrl,
            embedUrl: data.embedUrl ?? existing.embedUrl,
            thumbnailUrl: data.thumbnailUrl ?? existing.thumbnailUrl,
            duration: data.duration ?? existing.duration,
            categoryId: data.categoryId ?? existing.categoryId,
            speakerId: data.speakerId ?? existing.speakerId,
            isPublished: data.isPublished ?? existing.isPublished,
            isFeatured: data.isFeatured ?? existing.isFeatured,
            metaTitle: data.metaTitle ?? existing.metaTitle,
            metaDescription: data.metaDescription ?? existing.metaDescription,
            updatedAt: new Date(),
        }).where(eq(videos.id, resolvedParams.id));

        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "update",
            entityType: "video",
            entityId: resolvedParams.id,
            details: JSON.stringify({ title: data.title || existing.title }),
        });

        revalidatePath("/", "layout");
    return NextResponse.json({ message: "Video updated successfully" });
    } catch (error) {
        console.error("Update video error:", error);
        revalidatePath("/", "layout");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) revalidatePath("/", "layout");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;
        const existing = await db.query.videos.findFirst({
            where: eq(videos.id, resolvedParams.id),
        });

        if (!existing) revalidatePath("/", "layout");
    return NextResponse.json({ error: "Video not found" }, { status: 404 });

        await db.delete(videos).where(eq(videos.id, resolvedParams.id));

        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "delete",
            entityType: "video",
            entityId: resolvedParams.id,
            details: JSON.stringify({ title: existing.title }),
        });

        revalidatePath("/", "layout");
    return NextResponse.json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error("Delete video error:", error);
        revalidatePath("/", "layout");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

