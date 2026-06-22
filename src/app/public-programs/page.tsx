import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { HubLanding } from "@/components/shared/HubLanding";

export const dynamic = "force-dynamic";

const SLUG = "public-programs";
const DEFAULT_TITLE = "Public Programs | Tanzeem-e-Islami";
const DEFAULT_DESC = "Community programs and weekly gatherings.";
const FALLBACK_CARDS = [
  {
    title: "Quranic Circles",
    href: "/public-programs/quranic-circles",
    description: "Weekly study circles across Pakistan",
  },
  {
    title: "Khitabat-e-Jummah Addresses",
    href: "/public-programs/khitabat-e-jummah",
    description: "Archived Friday addresses",
  },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function PublicProgramsPage() {
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
        <div className="container mx-auto py-8 md:py-10 px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return (
    <HubLanding title="Public Programs" subtitle={DEFAULT_DESC} cards={FALLBACK_CARDS} />
  );
}
