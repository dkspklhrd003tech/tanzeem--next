import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageSections } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// GET - List sections for a specific page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    const sections = await db.query.pageSections.findMany({
      where: eq(pageSections.pageId, pageId),
      orderBy: [asc(pageSections.order)],
    });

    return NextResponse.json({ items: sections });
  } catch (error) {
    console.error("Get sections error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
