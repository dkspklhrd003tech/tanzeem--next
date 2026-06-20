import { getCmsPage } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/our-ideology/basic-belief";
const DEFAULT_TITLE = "Basic Belief | Tanzeem-e-Islami";

const DEFAULT_CONTENT = `
  <p>
    Tanzeem-e-Islami is founded upon the core beliefs of Islam as derived from the Quran and the Sunnah
    of Prophet Muhammad (peace be upon him). These beliefs are not merely theoretical but form the basis
    of a comprehensive worldview that guides every aspect of a Muslim's life.
  </p>
  <p>
    At the center of our belief is the absolute sovereignty of Allah (Tawheed) over all aspects of creation,
    including governance and legislation. No human authority, assembly, or king has the right to legislate
    in defiance of the Quran and Sunnah.
  </p>
  <p>
    We believe that accepting any authority other than Allah as supreme is a form of Shirk (associating
    partners with Allah), and that the primary duty of the Prophets was to free mankind from the
    subjugation of other humans and bring them under the sole obedience of their Creator.
  </p>
`;

const FALLBACK_ACCORDION = [
  {
    question: "Tawheed (Oneness of Allah)",
    answer: "We believe in the absolute oneness of Allah (SWT). He is the Creator, Sustainer, and Sovereign of the universe. No one is worthy of worship except Him. This fundamental belief forms the bedrock of our faith and worldview.",
  },
  {
    question: "Risalah (Prophethood)",
    answer: "We believe in all the prophets of Allah, from Adam (AS) to Muhammad (SAW). Prophet Muhammad (SAW) is the final messenger, and his Sunnah is the ultimate practical model for human guidance. We believe that the Quran was revealed to him as the final and complete guidance for humanity.",
  },
  {
    question: "Akhirah (Hereafter)",
    answer: "We firmly believe in the Day of Judgment when all of humanity will be resurrected and held accountable for their deeds. This belief instills a deep sense of responsibility and moral consciousness in every aspect of our lives.",
  },
  {
    question: "The Quran as Complete Guidance",
    answer: "We believe that the Holy Quran is not just a book of worship but a complete constitution for human life. It provides guidance for all spheres of life including spiritual, social, economic, political, and cultural aspects.",
  },
  {
    question: "Sunnah as Practical Model",
    answer: "The Sunnah of Prophet Muhammad (SAW) provides the practical interpretation and application of Quranic teachings. We strive to follow the Sunnah in all aspects of our lives as the perfect model of Islamic conduct.",
  },
  {
    question: "Shahada — The Declaration of Faith",
    answer: "The declaration 'La ilaha illallah, Muhammadur Rasulullah' (There is no god but Allah, and Muhammad is His messenger) is the foundation of Islamic faith and the entry point into the fold of Islam.",
  },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function BasicBeliefPage() {
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
    { name: "Basic Belief", path: "/organization/our-ideology/basic-belief" },
  ];

  return (
    <ModernizedProsePage
      title={page?.title || "Basic Belief"}
      excerpt={page?.excerpt || "The basic theological and ideological beliefs of Tanzeem-e-Islami."}
      content={page?.content || DEFAULT_CONTENT}
      slug={SLUG}
      breadcrumbs={breadcrumbs}
      featuredImage={page?.featuredImage}
      accordionItems={FALLBACK_ACCORDION}
      ctaHeading="Our Obligations"
      ctaSubheading="Learn about the critical obligations of Muslims regarding the establishment of Deen."
      ctaButtonLabel="Our Obligations"
      ctaButtonUrl="/organization/our-ideology/our-obligations"
    />
  );
}
