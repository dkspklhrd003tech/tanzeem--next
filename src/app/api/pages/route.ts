import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, like, desc, and } from "drizzle-orm";

// GET - List all pages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const search = searchParams.get("search");

    const conditions: any[] = [];

    if (published === "true") conditions.push(eq(pages.isPublished, true));
    else if (published === "false") conditions.push(eq(pages.isPublished, false));

    if (search) {
      conditions.push(
        or(
          like(pages.title, `%${search}%`),
          like(pages.slug, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const pagesData = await db.query.pages.findMany({
      where: whereClause,
      with: {
        author: {
          columns: { id: true, name: true, email: true },
        },
      },
      orderBy: [desc(pages.updatedAt)],
    });

    return NextResponse.json({ pages: pagesData });
  } catch (error) {
    console.error("Get pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new page
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await db.query.pages.findFirst({
      where: eq(pages.slug, data.slug),
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    const pageId = crypto.randomUUID();

    // Create page
    await db.insert(pages).values({
      id: pageId,
      title: data.title,
      slug: data.slug,
      content: data.content || "",
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      template: data.template || "default",
      parentId: data.parentId,
      order: data.order || 0,
      isPublished: data.isPublished ?? false,
      showInMenu: data.showInMenu ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      authorId: user.id,
      publishedAt: data.isPublished ? new Date() : null,
    });

    const newPage = await db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      with: {
        author: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "create",
      entityType: "page",
      entityId: pageId,
      details: JSON.stringify({ title: data.title }),
    });

    return NextResponse.json({ page: newPage }, { status: 201 });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
