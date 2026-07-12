import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";
import { DynamicPageContent } from "@/components/shared/DynamicPageContent";
import { buildMetadata } from "@/lib/seo";
import { resolveMediaUrl } from "@/lib/utils";
import { getCmsPage } from "@/lib/page-helpers";

export const dynamic = "force-dynamic";

const PAGE_SLUG = "policy";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { page } = await getCmsPage(PAGE_SLUG);

    if (!page || !page.isPublished) {
      return { title: "Policy | Tanzeem-e-Islami" };
    }

    return buildMetadata({
      title: page.metaTitle ?? page.title ?? "Policy",
      description: page.metaDescription ?? page.excerpt ?? undefined,
      path: `/${PAGE_SLUG}`,
      ogImage: page.featuredImage ?? null,
      noIndex: false,
    });
  } catch {
    return { title: "Policy | Tanzeem-e-Islami" };
  }
}

export default async function PolicyPage() {
  let pageData: Awaited<ReturnType<typeof getCmsPage>> | null = null;

  try {
    pageData = await getCmsPage(PAGE_SLUG);
  } catch (err) {
    console.error("Failed to fetch policy page:", err);
  }

  if (!pageData || !pageData.page || !pageData.page.isPublished) {
    notFound();
  }

  const { page, sections } = pageData;

  const featuredImage = page.featuredImage
    ? resolveMediaUrl(page.featuredImage)
    : null;

  return (
    <ModernizedProsePage
      title={page.title}
      excerpt={page.excerpt ?? undefined}
      content={page.content}
      slug={PAGE_SLUG}
      breadcrumbs={[{ name: page.title, path: `/${PAGE_SLUG}` }]}
      featuredImage={featuredImage}
      template={page.template ?? undefined}
    >
      {sections && sections.length > 0 && (
        <DynamicPageContent sections={sections as any} />
      )}
    </ModernizedProsePage>
  );
}
