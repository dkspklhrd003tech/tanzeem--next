import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { CTABanner } from "@/components/shared/CTABanner";

export const dynamic = "force-dynamic";

const SLUG = "quranic-circles";
const DEFAULT_TITLE = "Quranic Circles | Tanzeem-e-Islami";
const DEFAULT_DESC = "Join Tanzeem-e-Islami's Quranic study circles (Dars-e-Quran) to deepen your understanding of the Quran and its timeless message.";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function QuranicCirclesPage() {
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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Quranic Circles</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Join our Quran study circles (Dars-e-Quran) to deepen your understanding of the Quran and its message.
          </p>
          <h2>About Dars-e-Quran</h2>
          <p>Dars-e-Quran is the flagship educational program of Tanzeem-e-Islami.</p>
          <h2>Program Structure</h2>
          <ul>
            <li>Systematic study of the Quran with Tafseer</li>
            <li>Focus on understanding the message and its practical application</li>
            <li>Discussion and reflection on contemporary relevance</li>
            <li>Memorization of selected verses (optional)</li>
            <li>Q&A sessions for clarification</li>
          </ul>
          <h2>What You Will Learn</h2>
          <ul>
            <li>The central themes and messages of the Quran</li>
            <li>The historical context of revelation (Asbab al-Nuzul)</li>
            <li>Guidance for personal spiritual development</li>
            <li>Islamic principles for social and family life</li>
            <li>The Quranic perspective on contemporary issues</li>
          </ul>
          <h2>Schedule and Registration</h2>
          <p>Dars-e-Quran circles are conducted regularly. For schedule information and registration, please contact Markaz Tanzeem.</p>
        </article>
      </div>
      <CTABanner
        heading="Explore Online Courses"
        subheading="Study Islamic sciences online from anywhere in the world."
        buttonLabel="Online Courses"
        buttonUrl="/online-courses"
      />
    </main>
  );
}
