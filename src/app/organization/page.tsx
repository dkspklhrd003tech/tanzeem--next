import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { HubLanding } from "@/components/shared/HubLanding";

const SLUG = "organization";
const DEFAULT_TITLE = "Organization | Tanzeem-e-Islami";
const DEFAULT_DESC = "Learn about Tanzeem-e-Islami's history, mission, ideology, and leadership.";
const FALLBACK_CARDS = [
  { title: "Background", href: "/organization/background", description: "History and founding of Tanzeem-e-Islami" },
  { title: "Mission Statement", href: "/organization/mission-statement", description: "Our mission and purpose" },
  { title: "Our Ideology", href: "/organization/our-ideology", description: "Beliefs, obligations, methodology, and foundation" },
  { title: "The Founder", href: "/organization/the-founder", description: "Dr. Israr Ahmed (1932–2010)" },
  { title: "The Ameer", href: "/organization/the-ameer", description: "Shujauddin Sheikh — current leadership" },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function OrganizationPage() {
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
    <HubLanding title="Organization" subtitle={DEFAULT_DESC} cards={FALLBACK_CARDS} />
  );
}
