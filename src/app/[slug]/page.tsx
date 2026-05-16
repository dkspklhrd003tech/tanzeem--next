import { notFound } from 'next/navigation';
import { db } from '@/db';
import { pages, pageSections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Hero } from "@/components/home/Hero";
import { IntroSection } from "@/components/shared/IntroSection";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { Accordion } from "@/components/shared/Accordion";
import { TeamGrid } from "@/components/shared/TeamGrid";
import { MediaCardGrid } from "@/components/shared/MediaCardGrid";
import { PublicationGrid } from "@/components/shared/PublicationGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import { EmbedBlock } from "@/components/shared/EmbedBlock";

// Define the component map for rendering sections dynamically
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

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch page data
  const pageResult = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);

  if (!pageResult || pageResult.length === 0) {
    notFound();
  }

  const page = pageResult[0];

  // Fetch ordered sections
  const sectionsResult = await db.select()
    .from(pageSections)
    .where(eq(pageSections.pageId, page.id))
    .orderBy(pageSections.order);

  return (
    <main className="min-h-screen bg-background">
      {sectionsResult.length > 0 ? (
        <div className="flex flex-col">
          {sectionsResult.map((section) => {
            const SectionComponent = ComponentMap[section.type];
            if (!SectionComponent) {
              console.warn(`No component found for section type: ${section.type}`);
              return null;
            }
            
            return (
              <SectionComponent key={section.id} {...(section.config as Record<string, any>)} />
            );
          })}
        </div>
      ) : (
        <div className="container mx-auto py-12 md:py-16">
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
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
          </article>
        </div>
      )}
    </main>
  );
}
