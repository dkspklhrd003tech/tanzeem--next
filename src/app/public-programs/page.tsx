import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { HubLanding } from "@/components/shared/HubLanding";

export const dynamic = "force-dynamic";

const SLUG = "public-programs";
const DEFAULT_TITLE = "Public Programs | Tanzeem-e-Islami";
const DEFAULT_DESC = "Community programs and weekly gatherings.";
export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function PublicProgramsPage() {
  const { page, sections } = await getCmsPage(SLUG);

  if (page && sections.length > 0) {
    return (
      <main className=" bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  if (page) {
    return (
      <main className=" bg-background">
        <div className="container mx-auto py-6 md:py-8 max-w-4xl">
          <div className="prose prose-lg  max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return (
    <HubLanding title="Public Programs" subtitle={DEFAULT_DESC} cards={[]} />
  );
}
