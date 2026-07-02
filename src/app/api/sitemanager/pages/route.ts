import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages, activityLogs, users, pageSections } from "@/db/schema";
import { eq, or, like, desc, asc, and, not, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// ── Validation ────────────────────────────────────────────────────────────────

function validatePage(data: any, isCreate = true) {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== "string" || data.title.trim().length < 3) {
    errors.title = "Title is required and must be at least 3 characters.";
  } else if (data.title.trim().length > 200) {
    errors.title = "Title must be 200 characters or fewer.";
  }

  if (!data.slug || typeof data.slug !== "string") {
    errors.slug = "Slug is required.";
  } else if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(data.slug)) {
    errors.slug = "Slug must be lowercase alphanumeric with hyphens or slashes only.";
  }

  // Content is no longer strictly required when publishing because a page might use the dynamic PageSectionBuilder.

  if (data.metaTitle && data.metaTitle.length > 70) {
    errors.metaTitle = "Meta title must be 70 characters or fewer.";
  }

  if (data.metaDescription && data.metaDescription.length > 160) {
    errors.metaDescription = "Meta description must be 160 characters or fewer.";
  }

  return errors;
}

// ── GET /api/sitemanager/pages ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status") ?? "all";   // all | published | draft
    const search   = searchParams.get("search") ?? "";
    const sort     = searchParams.get("sort") ?? "newest";  // newest | oldest | az | za
    const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit    = Math.min(1000, parseInt(searchParams.get("limit") ?? "1000"));
    const offset   = (page - 1) * limit;

    const conditions: any[] = [];

    if (status === "published") conditions.push(eq(pages.isPublished, true));
    else if (status === "draft")  conditions.push(eq(pages.isPublished, false));

    if (search.trim()) {
      conditions.push(or(
        like(pages.title, `%${search.trim()}%`),
        like(pages.slug,  `%${search.trim()}%`)
      ));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy =
      sort === "oldest" ? [asc(pages.createdAt)]  :
      sort === "az"     ? [asc(pages.title)]       :
      sort === "za"     ? [desc(pages.title)]      :
                          [desc(pages.updatedAt)];

    const [rows, countResult] = await Promise.all([
      db.select({
        id:          pages.id,
        title:       pages.title,
        slug:        pages.slug,
        isPublished: pages.isPublished,
        template:    pages.template,
        parentId:    pages.parentId,
        updatedAt:   pages.updatedAt,
        createdAt:   pages.createdAt,
        authorName:  users.name,
        authorEmail: users.email,
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),

      db.select({ count: sql<number>`count(*)` })
        .from(pages)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return NextResponse.json({
      pages: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/sitemanager/pages:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST /api/sitemanager/pages ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const errors = validatePage(data, true);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    // Unique slug check
    const existing = await db.select({ id: pages.id })
      .from(pages).where(eq(pages.slug, data.slug.trim())).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ errors: { slug: "A page with this slug already exists." } }, { status: 422 });
    }

    const pageId = crypto.randomUUID();
    const isPublished = Boolean(data.isPublished);

    let originalPage = null;
    if (data.duplicateFromId) {
      const results = await db.select().from(pages).where(eq(pages.id, data.duplicateFromId)).limit(1);
      originalPage = results[0] || null;
    }

    await db.insert(pages).values({
      id:              pageId,
      title:           data.title.trim(),
      slug:            data.slug.trim(),
      content:         data.content || originalPage?.content || "",
      excerpt:         data.excerpt || originalPage?.excerpt || null,
      featuredImage:   data.featuredImage || originalPage?.featuredImage || null,
      template:        data.template || originalPage?.template || "default",
      parentId:        data.parentId || originalPage?.parentId || null,
      order:           data.order || originalPage?.order || 0,
      isPublished,
      showInMenu:      data.showInMenu || originalPage?.showInMenu || false,
      metaTitle:       data.metaTitle || originalPage?.metaTitle || null,
      metaDescription: data.metaDescription || originalPage?.metaDescription || null,
      metaKeywords:    data.metaKeywords || originalPage?.metaKeywords || null,
      canonicalUrl:    null,
      ogImage:         null,
      schemaType:      originalPage?.schemaType || "WebPage",
      noIndex:         false,
      authorId:        user.id,
      publishedAt:     isPublished ? new Date() : null,
      createdAt:       new Date(),
      updatedAt:       new Date(),
    });

    await db.insert(activityLogs).values({
      id:         crypto.randomUUID(),
      userId:     user.id,
      action:     isPublished ? "PAGE_PUBLISH" : "PAGE_CREATE",
      entityType: "page",
      entityId:   pageId,
      details:    `Created page "${data.title.trim()}"`,
      createdAt:  new Date(),
    });

    // Copy sections if duplicating
    if (data.duplicateFromId) {
      const oldSections = await db.select().from(pageSections).where(eq(pageSections.pageId, data.duplicateFromId));
      if (oldSections.length > 0) {
        const newSections = oldSections.map(s => ({
          ...s,
          id: crypto.randomUUID(),
          pageId: pageId,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        await db.insert(pageSections).values(newSections);
      }
    }

    const slug = data.slug.trim();
    try {
      revalidatePath(`/${slug}`);
      if (!slug.startsWith("organization/")) {
        revalidatePath(`/organization/${slug}`);
      } else {
        revalidatePath(`/organization/${slug.replace(/^[^/]+\//, "")}`);
      }
      revalidatePath("/[...slug]");
      revalidatePath("/");
    } catch (revalErr) {
      console.error("Cache revalidation failed during page creation:", revalErr);
    }

    const created = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
    return NextResponse.json({ page: created[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sitemanager/pages:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
