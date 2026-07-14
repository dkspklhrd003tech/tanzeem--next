import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, pageSections, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, and, not } from "drizzle-orm";
import { menuItems } from "@/db/schema";

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
    console.log(`Updating page ${id}:`, { title: data.title, sectionsCount: data.sections?.length });

    const existingPage = await db.query.pages.findFirst({
      where: eq(pages.id, id),
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (data.slug) {
      console.log(`Checking slug conflict for ${data.slug}, excluding ID: ${id}`);
      const slugConflict = await db.query.pages.findFirst({
        where: and(
          eq(pages.slug, data.slug),
          not(eq(pages.id, id))
        ),
      });

      if (slugConflict) {
        console.log(`Conflict found! Other page ID: ${slugConflict.id}, slug: ${slugConflict.slug}`);
        return NextResponse.json({ 
          error: `A page with this slug already exists (ID: ${slugConflict.id}, Current ID: ${id})` 
        }, { status: 400 });
      }
    }

    // Update page
    await db.update(pages).set({
      title: data.title ?? existingPage.title,
      slug: data.slug ?? existingPage.slug,
      content: data.content ?? existingPage.content ?? "",
      excerpt: data.excerpt ?? existingPage.excerpt,
      featuredImage: data.featuredImage ?? existingPage.featuredImage,
      template: data.template ?? existingPage.template ?? "default",
      parentId: data.parentId !== undefined ? data.parentId : existingPage.parentId,
      order: data.order ?? existingPage.order ?? 0,
      isPublished: data.isPublished ?? existingPage.isPublished,
      showInMenu: data.showInMenu ?? existingPage.showInMenu,
      metaTitle: data.metaTitle ?? existingPage.metaTitle,
      metaDescription: data.metaDescription ?? existingPage.metaDescription,
      publishedAt: data.isPublished && !existingPage.isPublished
        ? new Date()
        : existingPage.publishedAt,
    }).where(eq(pages.id, id));

    // Sync sections if provided
    if (data.sections && Array.isArray(data.sections)) {
      // Clear existing sections
      await db.delete(pageSections).where(eq(pageSections.pageId, id));
      
      // Insert new sections
      if (data.sections.length > 0) {
        await db.insert(pageSections).values(
          data.sections.map((s: any, index: number) => ({
            id: s.id && String(s.id).length >= 36 ? String(s.id) : crypto.randomUUID(),
            pageId: id,
            type: s.type,
            order: index,
            config: s.config || {},
            isActive: s.isActive ?? true,
          }))
        );
      }
    }

    // Sync menu items if slug or title changed
    const newSlug = data.slug ?? existingPage.slug;
    const oldSlug = existingPage.slug;
    const newTitle = data.title ?? existingPage.title;
    const oldTitle = existingPage.title;

    if (oldSlug !== newSlug || oldTitle !== newTitle) {
      // We want to find any menu items that point to the old URL
      const oldUrl = oldSlug.startsWith('/') ? oldSlug : `/${oldSlug}`;
      const newUrl = newSlug.startsWith('/') ? newSlug : `/${newSlug}`;

      const affectedMenus = await db.query.menuItems.findMany({
        where: eq(menuItems.url, oldUrl),
      });

      for (const menu of affectedMenus) {
        const updateData: any = { url: newUrl };
        // If the menu label was exactly the old page title, update the label too
        if (menu.label === oldTitle) {
          updateData.label = newTitle;
        }
        await db.update(menuItems).set(updateData).where(eq(menuItems.id, menu.id));
      }
    }

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
  } catch (error: any) {
    console.error("Update page error details:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
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
