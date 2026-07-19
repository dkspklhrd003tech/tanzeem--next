import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pageSections, pages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Revalidate every possible URL path that might be cached for this slug */
function revalidateAllPaths(rawSlug: string) {
  const slug = rawSlug.replace(/^\/+/, "");
  const segments = slug.split("/");

  // Collect every possible URL the user could have arrived at this page from
  const paths = new Set<string>();

  // 1. Canonical path
  paths.add(`/${slug}`);

  // 2. Without leading segment (e.g. "organization/our-ideology/basic-belief" → "our-ideology/basic-belief")
  if (segments.length > 1) {
    paths.add(`/${segments.slice(1).join("/")}`);
  }

  // 3. Without first two segments (e.g. → "basic-belief")
  if (segments.length > 2) {
    paths.add(`/${segments.slice(2).join("/")}`);
  }

  // 4. Without "organization/" prefix
  const withoutOrg = slug.replace(/^organization\//, "");
  if (withoutOrg !== slug) {
    paths.add(`/${withoutOrg}`);
    // also strip one more level
    const withoutOrgParts = withoutOrg.split("/");
    if (withoutOrgParts.length > 1) {
      paths.add(`/${withoutOrgParts.slice(1).join("/")}`);
    }
  }

  // 5. With "organization/" prefix (if not already there)
  if (!slug.startsWith("organization/")) {
    paths.add(`/organization/${slug}`);
  }

  // 6. Policy special route
  if (slug === "policy") paths.add("/policy");

  for (const p of paths) {
    try { revalidatePath(p); } catch (_) { /* ignore */ }
  }

  // Always bust the catch-all route and home
  try { revalidatePath("/[...slug]", "page"); } catch (_) { /* ignore */ }
  try { revalidatePath("/"); } catch (_) { /* ignore */ }
}

// GET - List sections for a specific page
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

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
    const authError = await requireAuth(request);
    if (authError) return authError;

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

    // Revalidate the cache for this page so changes show up immediately
    try {
      const [page] = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, pageId)).limit(1);
      if (page?.slug) {
        revalidateAllPaths(page.slug);
      }
    } catch (revalErr) {
      console.error("Cache revalidation failed in page_sections:", revalErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save sections error:", error);
    return NextResponse.json({ error: "Failed to save sections" }, { status: 500 });
  }
}
