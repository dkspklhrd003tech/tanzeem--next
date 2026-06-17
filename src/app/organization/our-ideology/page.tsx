import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { HubLanding } from "@/components/shared/HubLanding";

export const dynamic = "force-dynamic";

const SLUG = "organization/our-ideology";
const DEFAULT_TITLE = "Our Ideology | Tanzeem-e-Islami";
const DEFAULT_DESC = "Explore the beliefs, obligations, methodology, and foundation of Tanzeem-e-Islami.";
const FALLBACK_CARDS = [
  { title: "Basic Belief", href: "/organization/our-ideology/basic-belief", description: "Fundamental Islamic beliefs and principles" },
  { title: "Our Obligations", href: "/organization/our-ideology/our-obligations", description: "Our duties and responsibilities as Muslims" },
  { title: "Methodology", href: "/organization/our-ideology/methodology", description: "Our approach and method of work" },
  { title: "Foundation", href: "/organization/our-ideology/foundation", description: "The foundational principles of our movement" },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function IdeologyHubPage() {
  const { page, sections } = await getCmsPage(SLUG);

  if (page && sections.length > 0) {
    return (
      <main className="min-h-screen bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  if (page) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-12 md:py-16 px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return (
    <HubLanding title="Our Ideology" subtitle={DEFAULT_DESC} cards={FALLBACK_CARDS} />
  );
}
