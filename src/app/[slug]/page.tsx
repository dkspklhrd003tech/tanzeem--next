import { notFound } from 'next/navigation';
import { db } from '@/db';
import { pages, pageSections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Hero } from '@/components/home/Hero';
import { AboutAndLeaders } from '@/components/home/AboutAndLeaders';
import { SpotlightCampaigns } from '@/components/home/SpotlightCampaigns';
// other generic components that might be used
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Define the component map for rendering sections dynamically
const ComponentMap: Record<string, React.FC<any>> = {
  'hero': Hero,
  'founder': AboutAndLeaders,
  'spotlight': SpotlightCampaigns,
  // we can map other types here as they are added
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
      <Header />
      
      {sectionsResult.length > 0 ? (
        sectionsResult.map((section) => {
          const SectionComponent = ComponentMap[section.type];
          if (!SectionComponent) {
            console.warn(`No component found for section type: ${section.type}`);
            return null;
          }
          
          return (
            <SectionComponent key={section.id} {...(section.config as Record<string, any>)} />
          );
        })
      ) : (
        <div className="container mx-auto py-16">
          {/* Fallback to legacy content rendering if no sections defined */}
          <div dangerouslySetInnerHTML={{ __html: page.content }} className="prose max-w-none" />
        </div>
      )}

      <Footer />
    </main>
  );
}
