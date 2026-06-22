import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/the-ameer";
const DEFAULT_TITLE = "The Ameer | Tanzeem-e-Islami";

const FALLBACK_AMEER = {
  title: "Shujauddin Shaikh",
  excerpt: "AMEER (2020 – PRESENT)",
  featuredImage: "/uploads/f9d523c3-80f5-4aa9-8bcb-9394cfdb15ca-ameer.webp",
  slug: SLUG,
  content: `
    <p>Mohtaram Shujauddin Shaikh is the current Ameer (leader) of Tanzeem-e-Islami, who assumed the responsibility in 2020 following the resignation of Hafiz Akif Saeed on health grounds. Born on September 29, 1974, he has been an active member of the organization for over two decades, contributing significantly to its educational, organizational, and propagation activities across Pakistan and internationally.</p>
    
    <p>Before assuming the leadership, he served in various key capacities within Tanzeem-e-Islami, including as the Nazim of different regions and as a prominent speaker of Quranic lectures. He has gained widespread recognition for his articulation of Islamic teachings in the context of contemporary socio-political and economic challenges.</p>
    
    <p>Under his leadership, Tanzeem-e-Islami has significantly expanded its digital outreach, utilizing modern media platforms to broadcast Quranic education, lectures, and organizational messages to a global audience. He remains committed to the core vision of the founder, Dr. Israr Ahmed, focusing on individual reform (Tazkiyah) and collective struggle for the establishment of the Islamic system (Khilafah).</p>
    
    <p>He regularly delivers the Friday Sermon (Khitab-e-Jum'ah) at the central Quran Academy in Lahore and travels extensively to engage with different chapters of the organization and the broader Muslim community, emphasizing unity and disciplined effort.</p>
  `.trim()
};

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function AmeerPage() {
  const { page, sections } = await getCmsPage(SLUG);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Organization", path: "/organization" },
    { name: "The Ameer", path: "/organization/the-ameer" },
  ];

  if (page && sections.length > 0) {
    return (
      <main className="min-h-screen bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  if (page) {
    return (
      <ModernizedProsePage
        title={page.title}
        excerpt={page.excerpt}
        content={getCleanContent(page.content)}
        slug={page.slug}
        breadcrumbs={crumbs}
        featuredImage={page.featuredImage}
        template={page.template}
        ctaHeading="Explore Our Ideology"
        ctaSubheading="Learn about the beliefs and principles that guide our work."
        ctaButtonLabel="Our Ideology"
        ctaButtonUrl="/organization/our-ideology"
      />
    );
  }

  // Fallback if DB record doesn't exist
  return (
    <ModernizedProsePage
      title={FALLBACK_AMEER.title}
      excerpt={FALLBACK_AMEER.excerpt}
      content={FALLBACK_AMEER.content}
      slug={FALLBACK_AMEER.slug}
      breadcrumbs={crumbs}
      featuredImage={FALLBACK_AMEER.featuredImage}
      template="leader"
      ctaHeading="Explore Our Ideology"
      ctaSubheading="Learn about the beliefs and principles that guide our work."
      ctaButtonLabel="Our Ideology"
      ctaButtonUrl="/organization/our-ideology"
    />
  );
}
