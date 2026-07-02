import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { CTABanner } from "@/components/shared/CTABanner";

export const dynamic = "force-dynamic";

const SLUG = "ruju-ilal-quran";
const DEFAULT_TITLE = "Ruju Ilal Quran | Tanzeem-e-Islami";
const DEFAULT_DESC = "Return to the Quran — a movement to revive the Quranic spirit and implement its teachings in individual and collective life.";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function RujuIlalQuranPage() {
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
        <div className="container mx-auto py-6 md:py-8">
          <div className="prose prose-lg  max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <article className="prose prose-lg  max-w-4xl mx-auto">
          <h1>Ruju Ilal Quran</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Return to the Quran — a movement to revive the Quranic spirit and implement its teachings in individual and collective life.
          </p>
          <h2>The Call to Return to the Quran</h2>
          <p>Ruju Ilal Quran (Return to the Quran) is the foundational call of Tanzeem-e-Islami. It is an invitation to all Muslims to turn back to the Quran as the ultimate source of guidance, legislation, and spiritual inspiration.</p>
          <h2>Core Principles</h2>
          <ul>
            <li>The Quran is the primary source of guidance for all aspects of life</li>
            <li>Understanding the Quran requires both intellectual study and practical application</li>
            <li>Every Muslim has the right and responsibility to access the Quran directly</li>
            <li>The Quranic message must be understood in its historical context and applied to contemporary challenges</li>
            <li>Systematic study of the Quran leads to Iman (faith) and action</li>
          </ul>
          <h2>Our Approach</h2>
          <p>Tanzeem-e-Islami&apos;s educational programs are designed around the Ruju Ilal Quran framework.</p>
          <h2>Key Objectives</h2>
          <ul>
            <li>To create a Quran-centric worldview among Muslims</li>
            <li>To revive the tradition of Quranic scholarship and reflection</li>
            <li>To build a community that lives by Quranic values</li>
            <li>To establish educational institutions that prioritize Quranic studies</li>
            <li>To develop a generation committed to the message of the Quran</li>
          </ul>
        </article>
      </div>
      <CTABanner
        heading="Start Your Quranic Journey"
        subheading="Join our Dars-e-Quran program to study the Quran systematically."
        buttonLabel="Join Dars-e-Quran"
        buttonUrl="/darse-quran"
      />
    </main>
  );
}
