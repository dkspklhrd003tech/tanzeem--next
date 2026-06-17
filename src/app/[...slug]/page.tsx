import { notFound } from "next/navigation";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { IntroSection } from "@/components/shared/IntroSection";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { Accordion } from "@/components/shared/Accordion";
import { TeamGrid } from "@/components/shared/TeamGrid";
import { MediaCardGrid } from "@/components/shared/MediaCardGrid";
import { PublicationGrid } from "@/components/shared/PublicationGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import { EmbedBlock } from "@/components/shared/EmbedBlock";

export const dynamic = "force-dynamic";

// Component mapping for dynamic sections
const ComponentMap: Record<string, React.FC<any>> = {
    'hero': Hero,
    'intro': IntroSection,
    'stats': StatsGrid,
    'accordion': Accordion,
    'team': TeamGrid,
    'media_grid': MediaCardGrid,
    'publications': PublicationGrid,
    'cta_banner': CTABanner,
    'embed': EmbedBlock,
};

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

const parseSeoFromContent = (content: string) => {
  const match = content.match(/<!--SEO_METADATA_JSON:([\s\S]*?)-->/);
  let seo = {
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
    } catch (e) {
      console.error("Failed to parse SEO metadata", e);
    }
  }
  return { seo, cleanContent };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const slugArray = resolvedParams.slug;
    const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slugArray.join('/')),
    });

    if (!page || !page.isPublished) {
        return { title: "Page Not Found" };
    }

    const { seo } = parseSeoFromContent(page.content || "");
    const title = seo.ogTitle || page.metaTitle || page.title;
    const description = page.metaDescription || page.excerpt;
    const canonical = seo.canonicalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://tanzeem.org'}/${slugArray.join('/')}`;

    return {
        title: page.metaTitle || page.title,
        description,
        alternates: {
            canonical,
        },
        robots: seo.noIndex ? {
            index: false,
            follow: false,
        } : undefined,
        openGraph: {
            title,
            description: description || undefined,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tanzeem.org'}/${slugArray.join('/')}`,
            images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
        }
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug: slugArray } = await params;
    const slug = slugArray.join('/');

    console.log(`DynamicPage: slugArray=[${slugArray.join(', ')}], searching for slug="${slug}"`);

    // Fetch page data
    const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
    });

    if (!page) {
        console.log(`DynamicPage: No page found for slug="${slug}"`);
        notFound();
    }

    if (!page.isPublished) {
        console.log(`DynamicPage: Page "${page.title}" is NOT published`);
        notFound();
    }

    console.log(`DynamicPage: Found page "${page.title}"`);

    const { seo, cleanContent } = parseSeoFromContent(page.content || "");

    // Fetch ordered sections for this page
    const sections = await db.query.pageSections.findMany({
        where: and(
            eq(pageSections.pageId, page.id),
            eq(pageSections.isActive, true)
        ),
        orderBy: (sections, { asc }) => [asc(sections.order)],
    });

    return (
        <main className="min-h-screen bg-background">
            {/* Render dynamically parsed JSON-LD Schema if present */}
            {seo.schemaJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: seo.schemaJsonLd }}
                />
            )}
            {sections.length > 0 ? (
                <div className="flex flex-col">
                    {sections.map((section) => {
                        const SectionComponent = ComponentMap[section.type];
                        if (!SectionComponent) {
                            console.warn(`No component found for section type: ${section.type}`);
                            return null;
                        }
                        return (
                            <SectionComponent 
                                key={section.id} 
                                {...(section.config as any)} 
                            />
                        );
                    })}
                </div>
            ) : (
                <main className="container mx-auto py-12 md:py-16 px-4">
                    <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            {page.title}
                        </h1>
                        {page.featuredImage && (
                            <div className="mb-8 rounded-2xl overflow-hidden aspect-video relative">
                                <img
                                    src={page.featuredImage}
                                    alt={page.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div
                            className="mt-8 dynamic-content"
                            dangerouslySetInnerHTML={{ __html: cleanContent || "" }}
                        />
                    </article>
                </main>
            )}
        </main>
    );
}
