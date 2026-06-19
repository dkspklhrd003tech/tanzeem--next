import { notFound } from "next/navigation";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Metadata } from "next";
import Script from "next/script";
import { DynamicPageContent } from "@/components/shared/DynamicPageContent";
import { buildMetadata, webPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";

/**
 * ISR — revalidate every 5 minutes.
 * Pages are cached at the edge and rebuilt in the background when stale.
 * Individual pages can also be purged via revalidatePath() in the admin.
 */
export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug: slugArray } = await params;
    const slug = slugArray.join("/");

    const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
    });

    if (!page || !page.isPublished) return { title: "Page Not Found" };

    return buildMetadata({
        title: page.metaTitle ?? page.title,
        description: page.metaDescription ?? page.excerpt ?? undefined,
        path: `/${slug}`,
        ogImage: (page as any).ogImage ?? page.featuredImage ?? null,
        noIndex: (page as any).noIndex ?? false,
    });
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function DynamicPage({ params }: PageProps) {
    const { slug: slugArray } = await params;
    const slug = slugArray.join("/");

    const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
    });

    if (!page || !page.isPublished) notFound();

    const sections = await db.query.pageSections.findMany({
        where: and(
            eq(pageSections.pageId, page.id),
            eq(pageSections.isActive, true)
        ),
        orderBy: (s, { asc }) => [asc(s.order)],
    });

    // Build JSON-LD for this page
    const webpage = webPageJsonLd({
        title: page.metaTitle ?? page.title,
        description: page.metaDescription ?? page.excerpt ?? undefined,
        path: `/${slug}`,
        datePublished: page.publishedAt,
        dateModified: page.updatedAt,
    });

    const crumbs = [
        { name: "Home", path: "/" },
        ...slugArray.map((seg, i) => ({
            name: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
            path: "/" + slugArray.slice(0, i + 1).join("/"),
        })),
    ];
    const bc = breadcrumbJsonLd(crumbs);

    const ldId = slug.replace(/\//g, "-");

    return (
        <main className="min-h-screen bg-background">
            {/* Structured data */}
            <Script
                id={`jsonld-page-${ldId}`}
                type="application/ld+json"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }}
            />
            <Script
                id={`jsonld-bc-${ldId}`}
                type="application/ld+json"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }}
            />

            {/* Section-builder content (all 15 section types supported) */}
            {sections.length > 0 ? (
                <DynamicPageContent sections={sections as any} />
            ) : (
                /* Fallback: raw HTML prose from the Tiptap editor */
                <div className="container mx-auto py-12 md:py-16 px-4">
                    <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            {page.title}
                        </h1>
                        {page.featuredImage && (
                            <div className="mb-8 rounded-2xl overflow-hidden aspect-video">
                                <img
                                    src={page.featuredImage}
                                    alt={page.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {page.content &&
                            page.content.trim() &&
                            page.content !== "<p></p>" && (
                                <div
                                    className="mt-8"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />
                            )}
                    </article>
                </div>
            )}
        </main>
    );
}
