import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { CTABanner } from "@/components/shared/CTABanner";

const SLUG = "organization/mission-statement";
const DEFAULT_TITLE = "Mission Statement | Tanzeem-e-Islami";
const FALLBACK_STATS = [
  { number: "1975", label: "Founded" },
  { number: "50+", label: "Years of Service" },
  { number: "100+", label: "Dars-e-Quran Circles" },
  { number: "Global", label: "Reach" },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function MissionStatementPage() {
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
          <h1>Mission Statement</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Tanzeem-e-Islami is dedicated to the revival of the Islamic way of life (Deen-e-Islam) in its totality, based on the Quran and the Sunnah of Prophet Muhammad (peace be upon him).
          </p>
          <h2>Our Mission</h2>
          <p>
            The mission of Tanzeem-e-Islami is to work for the establishment of the Islamic System (Nizam-e-Mustafa)
            in all aspects of human life &mdash; individual, familial, societal, and political. We believe that Islam is
            not merely a set of rituals but a complete code of life that provides guidance for every sphere of
            human activity.
          </p>
          <h3>Key Objectives</h3>
          <ul>
            <li><strong>Revival of Faith (Iman):</strong> To revive the true spirit of Iman (faith) in the hearts of Muslims, based on the understanding of the Quran and the Sunnah.</li>
            <li><strong>Intellectual Awakening:</strong> To promote critical thinking and intellectual engagement with Islamic teachings, addressing contemporary challenges from an Islamic perspective.</li>
            <li><strong>Moral Training (Tazkiyah):</strong> To provide spiritual and moral training to individuals so that they become exemplary Muslims and agents of positive change in society.</li>
            <li><strong>Social Reform:</strong> To work for the reform of society based on Islamic values of justice, compassion, and brotherhood.</li>
            <li><strong>Political Consciousness:</strong> To create awareness among Muslims about their political rights and responsibilities, and to work for the establishment of the Islamic system of governance.</li>
            <li><strong>Unity of the Ummah:</strong> To promote unity and cooperation among different Islamic movements and organizations for the collective revival of the Ummah.</li>
          </ul>
          <h2>Our Vision</h2>
          <p>
            We envision a world where Islam is understood and practiced in its complete form, where the Islamic
            system of social justice, economic fairness, and political participation is established, and where
            Muslims play a leading role in the moral and intellectual development of humanity.
          </p>
        </article>
      </div>
      <StatsGrid stats={FALLBACK_STATS} />
      <CTABanner
        heading="Explore Our Ideology"
        subheading="Learn about the beliefs and principles that guide our work."
        buttonLabel="Our Ideology"
        buttonUrl="/organization/our-ideology"
      />
    </main>
  );
}
