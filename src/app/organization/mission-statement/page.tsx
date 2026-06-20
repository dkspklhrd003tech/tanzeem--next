import { getCmsPage } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/mission-statement";
const DEFAULT_TITLE = "Mission Statement | Tanzeem-e-Islami";

const DEFAULT_CONTENT = `
  <p class="lead">
    Tanzeem-e-Islami is dedicated to the revival of the Islamic way of life (Deen-e-Islam) in its totality, based on the Quran and the Sunnah of Prophet Muhammad (peace be upon him).
  </p>
  <p>
    Our mission is to establish the Deen of Allah in its entirety, at all levels of human existence — individual as well as collective, societal as well as state.
  </p>
  <p>
    We believe that the struggle to establish the Islamic system of social justice is the ultimate obligation of every Muslim in the present era, and this struggle must be carried out in an organized manner through a disciplined jamaat (party).
  </p>
  <h2>Core Objectives</h2>
  <ul>
    <li><strong>Revival of Faith (Iman):</strong> To revive the true spirit of Iman (faith) in the hearts of Muslims, based on the understanding of the Quran and the Sunnah.</li>
    <li><strong>Intellectual Awakening:</strong> To promote critical thinking and intellectual engagement with Islamic teachings, addressing contemporary challenges from an Islamic perspective.</li>
    <li><strong>Moral Training (Tazkiyah):</strong> To provide spiritual and moral training to individuals so that they become exemplary Muslims and agents of positive change in society.</li>
    <li><strong>Social Reform:</strong> To work for the reform of society based on Islamic values of justice, compassion, and brotherhood.</li>
    <li><strong>Political Consciousness:</strong> To create awareness among Muslims about their political rights and responsibilities, and to struggle for the establishment of the Islamic system of governance (Khilafah).</li>
    <li><strong>Unity of the Ummah:</strong> To promote unity and cooperation among different Islamic movements and organizations for the collective revival of the Ummah.</li>
  </ul>
  <h2>Our Vision</h2>
  <p>
    We envision a world where Islam is understood and practiced in its complete form, where the Islamic system of social justice, economic fairness, and political participation is established, and where Muslims play a leading role in the moral and intellectual development of humanity.
  </p>
`;

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

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Organization", path: "/organization" },
    { name: "Mission Statement", path: "/organization/mission-statement" }
  ];

  return (
    <ModernizedProsePage
      title={page?.title || "Mission Statement"}
      excerpt={page?.excerpt || "The defined purpose and mission of Tanzeem-e-Islami."}
      content={page?.content || DEFAULT_CONTENT}
      slug={SLUG}
      breadcrumbs={breadcrumbs}
      featuredImage={page?.featuredImage}
      stats={FALLBACK_STATS}
      ctaHeading="Explore Our Ideology"
      ctaSubheading="Learn about the beliefs and principles that guide our work."
      ctaButtonLabel="Our Ideology"
      ctaButtonUrl="/organization/our-ideology"
    />
  );
}
