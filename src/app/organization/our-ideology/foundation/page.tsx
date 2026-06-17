import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { CTABanner } from "@/components/shared/CTABanner";

const SLUG = "organization/our-ideology/foundation";
const DEFAULT_TITLE = "Foundation | Tanzeem-e-Islami";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function FoundationPage() {
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
          <h1>Foundation</h1>
          <p>The foundation of Tanzeem-e-Islami rests upon the firm belief that Islam is a complete code of life (Deen) and that the Quran and Sunnah provide comprehensive guidance for humanity in all times and places.</p>
          <h2>I. The Quran as the Primary Source</h2>
          <p>The Holy Quran is the ultimate source of guidance for Tanzeem-e-Islami.</p>
          <h2>II. The Sunnah as the Practical Model</h2>
          <p>The life of Prophet Muhammad (SAW) provides the perfect practical model for implementing Quranic teachings.</p>
          <h2>III. The Islamic Concept of Tawheed</h2>
          <p>The concept of Tawheed (Oneness of Allah) is the central organizing principle of our worldview.</p>
          <h2>IV. The Comprehensive Nature of Deen</h2>
          <p>Islam is not a religion in the Western sense — a set of private beliefs and rituals. It is a complete Deen.</p>
          <h2>V. The Concept of Ummah</h2>
          <p>Muslims are not just a religious community but a distinct nation (Ummah) with a unique identity, mission, and destiny.</p>
          <h2>VI. The Principle of Shura (Consultation)</h2>
          <p>Decision-making in Tanzeem-e-Islami is based on the principle of Shura (mutual consultation).</p>
          <h2>VII. Gradual and Systematic Change</h2>
          <p>Islamic revival requires patient, systematic, and sustained effort through education, training, and institution-building.</p>
        </article>
      </div>
      <CTABanner
        heading="Meet Our Founder"
        subheading="Learn about Dr. Israr Ahmed, the visionary founder of Tanzeem-e-Islami."
        buttonLabel="The Founder"
        buttonUrl="/organization/the-founder"
      />
    </main>
  );
}
