import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: "No slug provided" }, { status: 400 });

    // Ensure the video exists first
    const existing = await db.query.videos.findFirst({
      where: eq(videos.slug, slug),
      columns: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Atomically increment the view count
    await db
      .update(videos)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(videos.id, existing.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track video view:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
