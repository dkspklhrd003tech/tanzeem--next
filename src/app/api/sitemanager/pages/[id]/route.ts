import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages, activityLogs, users } from "@/db/schema";
import { eq, and, not, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** Revalidate every possible URL that might be cached for a given slug */
function revalidateAllPaths(rawSlug: string) {
  const slug = rawSlug.replace(/^\/+/, "");
  const segments = slug.split("/");
  const paths = new Set<string>();

  paths.add(`/${slug}`);
  if (segments.length > 1) paths.add(`/${segments.slice(1).join("/")}`);
  if (segments.length > 2) paths.add(`/${segments.slice(2).join("/")}`);

  const withoutOrg = slug.replace(/^organization\//, "");
  if (withoutOrg !== slug) {
    paths.add(`/${withoutOrg}`);
    const woParts = withoutOrg.split("/");
    if (woParts.length > 1) paths.add(`/${woParts.slice(1).join("/")}`);
  }
  if (!slug.startsWith("organization/")) paths.add(`/organization/${slug}`);
  if (slug === "policy") { try { revalidatePath("/policy", "page"); } catch (_) {} }

  for (const p of paths) { try { revalidatePath(p); } catch (_) {} }
  try { revalidatePath("/[...slug]", "page"); } catch (_) {}
  try { revalidatePath("/"); } catch (_) {}
}

type Ctx = { params: Promise<{ id: string }> };

function validateUpdate(data: any) {
  const errors: Record<string, string> = {};
  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
    else if (data.title.trim().length > 200) errors.title = "Title must be 200 characters or fewer.";
  }
  if (data.slug !== undefined && !/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(data.slug)) {
    errors.slug = "Slug must be lowercase alphanumeric with hyphens or slashes only.";
  }
  // Content is no longer strictly required when publishing because a page might use the dynamic PageSectionBuilder.
  if (data.metaTitle && data.metaTitle.length > 70) errors.metaTitle = "Meta title must be 70 characters or fewer.";
  if (data.metaDescription && data.metaDescription.length > 160) errors.metaDescription = "Meta description must be 160 characters or fewer.";
  return errors;
}

// ── GET /api/sitemanager/pages/[id] ──────────────────────────────────────────

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [page] = await db.select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      content: pages.content,
      excerpt: pages.excerpt,
      featuredImage: pages.featuredImage,
      template: pages.template,
      parentId: pages.parentId,
      order: pages.order,
      isPublished: pages.isPublished,
      showInMenu: pages.showInMenu,
      metaTitle: pages.metaTitle,
      metaDescription: pages.metaDescription,
      
      canonicalUrl: pages.canonicalUrl,
      ogImage: pages.ogImage,
      schemaType: pages.schemaType,
      noIndex: pages.noIndex,
      seoData: pages.seoData,
      featuredImageAlt: pages.featuredImageAlt,
      publishedAt: pages.publishedAt,
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
      authorId: pages.authorId,
      authorName: users.name,
      authorEmail: users.email,
    })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(or(eq(pages.id, id), eq(pages.slug, id)))
      .limit(1);

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (err) {
    console.error("GET /api/sitemanager/pages/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PUT /api/sitemanager/pages/[id] ──────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const data = await request.json();

    const errors = validateUpdate(data);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    let [existing] = await db.select().from(pages).where(or(eq(pages.id, id), eq(pages.slug, id))).limit(1);
    
    if (!existing) {
      // Upsert fallback for hardcoded system pages (like "services", "campaigns")
      const newId = id.length > 50 ? crypto.randomUUID() : id;
      const newSlug = data.slug || id;

      const [conflict] = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, newSlug)).limit(1);
      if (conflict) {
        return NextResponse.json({ errors: { slug: "A page with this slug already exists." } }, { status: 422 });
      }

      await db.insert(pages).values({
        id: newId,
        title: data.title || id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: newSlug,
        content: data.content || "",
        isPublished: data.isPublished ?? true,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || "",
        authorId: user.id,
        publishedAt: new Date(),
      });

      const [inserted] = await db.select().from(pages).where(eq(pages.id, newId)).limit(1);
      existing = inserted;
    } else {
      // Slug uniqueness check (exclude self)
      if (data.slug && data.slug !== existing.slug) {
        const [conflict] = await db.select({ id: pages.id })
          .from(pages)
          .where(and(eq(pages.slug, data.slug), not(eq(pages.id, existing.id))))
          .limit(1);
        if (conflict) {
          return NextResponse.json({ errors: { slug: "A page with this slug already exists." } }, { status: 422 });
        }
      }
    }

    const wasPublished = existing.isPublished;
    const nowPublished = data.isPublished ?? existing.isPublished;

    await db.update(pages).set({
      title: data.title ?? existing.title,
      slug: data.slug ?? existing.slug,
      content: data.content ?? existing.content,
      excerpt: data.excerpt !== undefined ? data.excerpt : existing.excerpt,
      featuredImage: data.featuredImage !== undefined ? data.featuredImage : existing.featuredImage,
      template: data.template ?? existing.template,
      parentId: data.parentId !== undefined ? data.parentId : existing.parentId,
      order: data.order ?? existing.order,
      isPublished: nowPublished,
      showInMenu: data.showInMenu ?? existing.showInMenu,
      metaTitle: data.metaTitle !== undefined ? data.metaTitle : existing.metaTitle,
      metaDescription: data.metaDescription !== undefined ? data.metaDescription : existing.metaDescription,
      
      canonicalUrl: data.canonicalUrl !== undefined ? data.canonicalUrl : existing.canonicalUrl,
      ogImage: data.ogImage !== undefined ? data.ogImage : existing.ogImage,
      schemaType: data.schemaType !== undefined ? data.schemaType : existing.schemaType,
      noIndex: data.noIndex !== undefined ? data.noIndex : existing.noIndex,
      seoData: data.seoData !== undefined ? data.seoData : existing.seoData,
      featuredImageAlt: data.featuredImageAlt !== undefined ? data.featuredImageAlt : existing.featuredImageAlt,
      publishedAt: (!wasPublished && nowPublished) ? new Date() : existing.publishedAt,
    }).where(eq(pages.id, existing.id));

    // Clear Next.js ISR cache for all possible URL variants of this page
    const updatedSlugRaw = data.slug ?? existing.slug;
    const existingSlug = existing.slug ?? "";
    try {
      revalidateAllPaths(updatedSlugRaw);
      if (existingSlug !== updatedSlugRaw) revalidateAllPaths(existingSlug);
    } catch (revalErr) {
      console.error("Cache revalidation failed:", revalErr);
    }

    // Determine action label for activity log
    const action =
      !wasPublished && nowPublished ? "PAGE_PUBLISH" :
        wasPublished && !nowPublished ? "PAGE_ARCHIVE" :
          "PAGE_UPDATE";

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action,
      entityType: "page",
      entityId: existing.id,
      details: `${action === "PAGE_PUBLISH" ? "Published" : action === "PAGE_ARCHIVE" ? "Archived" : "Updated"} page "${data.title ?? existing.title}"`,
    });

    const [updated] = await db.select().from(pages).where(eq(pages.id, existing.id)).limit(1);
    return NextResponse.json({ page: updated });
  } catch (err) {
    console.error("PUT /api/sitemanager/pages/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE /api/sitemanager/pages/[id] ───────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const [existing] = await db.select().from(pages).where(or(eq(pages.id, id), eq(pages.slug, id))).limit(1);
    if (!existing) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    await db.delete(pages).where(eq(pages.id, existing.id));

    // Clear Next.js cache for the deleted page
    try {
      revalidatePath(`/${existing.slug}`);
      if (!existing.slug.startsWith("organization/")) {
        revalidatePath(`/organization/${existing.slug}`);
      } else {
        revalidatePath(`/organization/${existing.slug.replace(/^[^/]+\//, "")}`);
      }
      revalidatePath("/[...slug]", "page");
      revalidatePath("/");
    } catch (revalErr) {
      console.error("Cache revalidation failed during delete:", revalErr);
    }

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "PAGE_DELETE",
      entityType: "page",
      entityId: existing.id,
      details: `Deleted page "${existing.title}"`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/sitemanager/pages/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
