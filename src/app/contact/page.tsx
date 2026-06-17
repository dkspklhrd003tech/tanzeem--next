import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ContactSection } from "@/components/shared/ContactSection";

export const dynamic = "force-dynamic";

const SLUG = "contact";
const DEFAULT_TITLE = "Contact Us | Tanzeem-e-Islami";
const DEFAULT_DESC = "Get in touch with Tanzeem-e-Islami. Find our contact details, office locations, and reach out to us with your queries.";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function ContactPage() {
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
        <div className="container mx-auto py-12 md:py-16 px-4">
          <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return <ContactSection />;
}
