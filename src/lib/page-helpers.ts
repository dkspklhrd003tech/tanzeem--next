import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface CmsPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
}

export interface CmsSectionData {
  id: string;
  pageId: string;
  type: string;
  order: number;
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface CmsPageResult {
  page: CmsPageData | null;
  sections: CmsSectionData[];
}

export async function getCmsPage(slug: string): Promise<CmsPageResult> {
  // Build candidate slugs to handle prefix mismatches between
  // how pages were created in the CMS vs. how frontend routes reference them.
  // e.g. route uses "organization/our-ideology" but DB might have "our-ideology"
  const candidates = [slug];
  if (slug.includes("/")) {
    // Try without the first path segment  (organization/our-ideology → our-ideology)
    candidates.push(slug.replace(/^[^/]+\//, ""));
  }
  // Also try with "organization/" prefix if not already present
  if (!slug.startsWith("organization/")) {
    candidates.push(`organization/${slug}`);
  }

  let page = null;
  for (const candidate of candidates) {
    page = await db.query.pages.findFirst({
      where: eq(pages.slug, candidate),
    });
    if (page && page.isPublished) break;
    page = null; // reset if not published
  }

  if (!page || !page.isPublished) {
    return { page: null, sections: [] };
  }

  const sections = await db.query.pageSections.findMany({
    where: and(
      eq(pageSections.pageId, page.id),
      eq(pageSections.isActive, true)
    ),
    orderBy: (sections, { asc }) => [asc(sections.order)],
  });

  return {
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt,
      featuredImage: page.featuredImage,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      isPublished: page.isPublished,
    },
    sections: sections.map((s) => ({
      id: s.id,
      pageId: s.pageId,
      type: s.type,
      order: s.order,
      config: s.config as Record<string, unknown>,
      isActive: s.isActive,
    })),
  };
}

const parseSeoFromContent = (content: string) => {
  const match = content.match(/<!--SEO_METADATA_JSON:([\s\S]*?)-->/);
  let seo: Record<string, string | boolean> = {
    canonicalUrl: "",
    noIndex: false,
    ogTitle: "",
    ogImage: "",
    schemaType: "WebPage",
    schemaJsonLd: "",
  };
  let cleanContent = content;
  if (match) {
    try {
      seo = { ...seo, ...JSON.parse(match[1]) };
      cleanContent = content.replace(/<!--SEO_METADATA_JSON:[\s\S]*?-->/, "").trim();
    } catch {
      // ignore parse errors
    }
  }
  return { seo, cleanContent };
};

export function getCleanContent(content: string): string {
  return parseSeoFromContent(content).cleanContent;
}
