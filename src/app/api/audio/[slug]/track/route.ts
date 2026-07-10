import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audio } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: "No slug provided" }, { status: 400 });

    // Ensure the audio exists first
    const existing = await db.query.audio.findFirst({
      where: eq(audio.slug, slug),
      columns: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Atomically increment the play count
    await db
      .update(audio)
      .set({ playCount: sql`play_count + 1` })
      .where(eq(audio.id, existing.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track audio play:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
