import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, and } from "drizzle-orm";

// GET - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const page = await db.query.pages.findFirst({
      where: eq(pages.id, id),
      with: {
        author: {
          columns: { id: true, name: true, email: true },
        },
        parent: true,
        children: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update page
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

    const existingPage = await db.query.pages.findFirst({
      where: eq(pages.id, id),
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (data.slug && data.slug !== existingPage.slug) {
      const slugConflict = await db.query.pages.findFirst({
        where: eq(pages.slug, data.slug),
      });

      if (slugConflict) {
        return NextResponse.json({ error: "A page with this slug already exists" }, { status: 400 });
      }
    }

    await db.update(pages).set({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      template: data.template,
      parentId: data.parentId,
      order: data.order,
      isPublished: data.isPublished,
      showInMenu: data.showInMenu,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      publishedAt: data.isPublished && !existingPage.isPublished
        ? new Date()
        : existingPage.publishedAt,
    }).where(eq(pages.id, id));

    const updatedPage = await db.query.pages.findFirst({
      where: eq(pages.id, id),
      with: {
        author: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "update",
      entityType: "page",
      entityId: updatedPage?.id,
      details: JSON.stringify({ title: updatedPage?.title }),
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete page
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

    const existingPage = await db.query.pages.findFirst({
      where: eq(pages.id, id),
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await db.delete(pages).where(eq(pages.id, id));

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "delete",
      entityType: "page",
      entityId: id,
      details: JSON.stringify({ title: existingPage.title }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
