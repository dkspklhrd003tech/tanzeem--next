import { getCmsPage } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/our-ideology/foundation";
const DEFAULT_TITLE = "Foundation | Tanzeem-e-Islami";

const DEFAULT_CONTENT = `
  <p>
    The foundation of Tanzeem-e-Islami rests upon the firm belief that Islam is a complete code of life
    (Deen) and that the Quran and Sunnah provide comprehensive guidance for humanity in all times and places.
  </p>
  <p>
    The foundation of Tanzeem-e-Islami was laid in 1975 by Dr. Israr Ahmed along with a small group of
    dedicated companions who felt the urgent need for a structured effort to re-establish the Islamic
    system in Pakistan and beyond.
  </p>
  <p>
    The foundation stone was laid with a commitment to listen and obey (Bai'ah) the Ameer in all matters
    conforming to the Shari'ah, restoring the early Islamic model of organization.
  </p>
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
`;

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

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Organization", path: "/organization" },
    { name: "Our Ideology", path: "/organization/our-ideology" },
    { name: "Foundation", path: "/organization/our-ideology/foundation" },
  ];

  return (
    <ModernizedProsePage
      title={page?.title || "Foundation"}
      excerpt={page?.excerpt || "The historical foundation and establishment of Tanzeem-e-Islami."}
      content={page?.content || DEFAULT_CONTENT}
      slug={SLUG}
      breadcrumbs={breadcrumbs}
      featuredImage={page?.featuredImage}
      ctaHeading="Meet Our Founder"
      ctaSubheading="Learn about Dr. Israr Ahmed, the visionary founder of Tanzeem-e-Islami."
      ctaButtonLabel="The Founder"
      ctaButtonUrl="/organization/the-founder"
    />
  );
}
