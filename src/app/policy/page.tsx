import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";
import { buildMetadata } from "@/lib/seo";
import { resolveMediaUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SLUG = "policy";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, PAGE_SLUG))
      .limit(1);

    if (!page || !page.isPublished) {
      return { title: "Policy | Tanzeem-e-Islami" };
    }

    return buildMetadata({
      title: page.metaTitle ?? page.title ?? "Policy",
      description: page.metaDescription ?? page.excerpt ?? undefined,
      path: `/${PAGE_SLUG}`,
      ogImage: page.ogImage ?? page.featuredImage ?? null,
      noIndex: page.noIndex ?? false,
    });
  } catch {
    return { title: "Policy | Tanzeem-e-Islami" };
  }
}

export default async function PolicyPage() {
  let page: typeof pages.$inferSelect | null = null;

  try {
    const [result] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, PAGE_SLUG))
      .limit(1);
    page = result ?? null;
  } catch (err) {
    console.error("Failed to fetch policy page:", err);
  }

  if (!page || !page.isPublished) {
    notFound();
  }

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
    />
  );
}

