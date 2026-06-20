import { getCmsPage } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/our-ideology/methodology";
const DEFAULT_TITLE = "Methodology | Tanzeem-e-Islami";

const DEFAULT_CONTENT = `
  <p>
    Tanzeem-e-Islami follows a comprehensive methodology rooted in the Quran and Sunnah for the revival of Islam.
  </p>
  <p>
    Our methodology is derived directly from the Seerah (biography) of Prophet Muhammad (PBUH) during the
    Makkan and early Madinan periods. This methodology is peaceful, educational, and revolutionary, avoiding
    any underground or militant struggle.
  </p>
  <h2>The Four-Stage Methodology</h2>
  <h3>1. Iman-based Purification (Tazkiyah)</h3>
  <p>The first and foundational stage is the purification of the self through faith.</p>
  <ul>
    <li>Regular study and reflection on the Quran</li>
    <li>Dhikr (remembrance of Allah) and contemplation</li>
    <li>Sincere repentance and self-accountability</li>
    <li>Following the Sunnah in daily life</li>
  </ul>
  <h3>2. Intellectual Training (Tarbiyah)</h3>
  <p>The second stage focuses on building a deep understanding of Islam and its comprehensive system.</p>
  <ul>
    <li>The Quran with Tafseer (exegesis)</li>
    <li>Hadith and Sunnah literature</li>
    <li>Islamic history and civilization</li>
    <li>Contemporary issues from an Islamic perspective</li>
  </ul>
  <h3>3. Invitation and Propagation (Dawah wal Tableegh)</h3>
  <p>The third stage involves actively inviting others to the path of Allah through personal example, public lectures, publications, and digital da'wah.</p>
  <h3>4. Collective Struggle (Jama'ie Jihad)</h3>
  <p>The final stage is organized, collective effort for the establishment of the Islamic system through building organized teams, establishing institutions, and working for systemic change.</p>
  <h2>Key Principles of Our Methodology</h2>
  <ul>
    <li><strong>Gradual Approach:</strong> Change is brought about gradually through education and training.</li>
    <li><strong>Priority of Individual Reform:</strong> Society can only be reformed when individuals are reformed first.</li>
    <li><strong>Balance (Wasatiyyah):</strong> Maintaining balance between spiritual and worldly aspects.</li>
    <li><strong>Comprehensiveness:</strong> Addressing all aspects of life.</li>
    <li><strong>Non-violence:</strong> Working through peaceful means within the framework of law.</li>
  </ul>
`;

const FALLBACK_STATS = [
  { number: "Tazkiyah", label: "Purification of Self" },
  { number: "Tarbiyah", label: "Intellectual Training" },
  { number: "Dawah", label: "Invitation to Islam" },
  { number: "Jihad", label: "Struggle for Islam" },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function MethodologyPage() {
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
    { name: "Methodology", path: "/organization/our-ideology/methodology" },
  ];

  return (
    <ModernizedProsePage
      title={page?.title || "Methodology"}
      excerpt={page?.excerpt || "The prophetic methodology for Islamic revolution and reform."}
      content={page?.content || DEFAULT_CONTENT}
      slug={SLUG}
      breadcrumbs={breadcrumbs}
      featuredImage={page?.featuredImage}
      stats={FALLBACK_STATS}
      ctaHeading="Explore Our Foundation"
      ctaSubheading="Discover the historical foundation and establishment of Tanzeem-e-Islami."
      ctaButtonLabel="Foundation"
      ctaButtonUrl="/organization/our-ideology/foundation"
    />
  );
}
