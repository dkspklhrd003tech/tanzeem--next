import { NextResponse } from "next/server";
import { db } from "@/db";
import { pressReleases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const items = await db
      .select()
      .from(pressReleases)
      .where(eq(pressReleases.isPublished, true))
      .orderBy(desc(pressReleases.publishedAt), desc(pressReleases.createdAt))
      .limit(limit);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Press releases fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
