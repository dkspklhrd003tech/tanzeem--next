import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

// GET - List all media items
export async function GET(request: NextRequest) {
  try {
    const data = await db.query.media.findMany({
      orderBy: [desc(media.createdAt)],
    });
    return NextResponse.json({ media: data });
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create media record (after upload)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    if (!data.filename || !data.url) {
      return NextResponse.json({ error: "Filename and URL are required" }, { status: 400 });
    }

    const mediaId = crypto.randomUUID();

    await db.insert(media).values({
      id: mediaId,
      filename: data.filename,
      originalName: data.originalName || data.filename,
      mimeType: data.mimeType || "application/octet-stream",
      size: data.size || 0,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      altText: data.altText,
      caption: data.caption,
      uploadedBy: user.id,
    });

    const newMedia = await db.query.media.findFirst({
      where: eq(media.id, mediaId),
    });

    return NextResponse.json({ media: newMedia }, { status: 201 });
  } catch (error) {
    console.error("Create media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
