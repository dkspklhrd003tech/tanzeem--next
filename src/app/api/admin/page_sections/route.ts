import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

// POST - Save/upsert all sections for a page (batch replace)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, sections } = body;

    if (!pageId || !Array.isArray(sections)) {
      return NextResponse.json({ error: "pageId and sections array required" }, { status: 400 });
    }

    // Delete existing sections for this page
    await db.delete(pageSections).where(eq(pageSections.pageId, pageId));

    // Insert new sections
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await db.insert(pageSections).values({
        id: s.id || uuidv4(),
        pageId,
        type: s.type,
        order: i,
        config: s.config || {},
        isActive: s.isActive !== false,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save sections error:", error);
    return NextResponse.json({ error: "Failed to save sections" }, { status: 500 });
  }
}
