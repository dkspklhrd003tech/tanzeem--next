import { getCmsPage } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/background";
const DEFAULT_TITLE = "Background | Tanzeem-e-Islami";

const DEFAULT_CONTENT = `
  <p>
    The essence of what we call the "Islamic revolutionary thought" consists of the idea that <strong>it is not enough to practice Islam in one's individual life but that the teachings of the Qur'an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life.</strong>
  </p>
  <p>
    The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal. The first attempt towards the actualization of this concept was made by Maulana Abul Kalam Azad through his short-lived party, the Hizbullah. Another attempt was made by Maulana Sayyid Abul A'la Maududi through his Jama'at-e-Islami; however, the decision by the Jama'at after the creation of Pakistan to take part in the electoral process instead of continuing the original revolutionary methodology gradually resulted in its degeneration from a pure Islamic revolutionary party to a mere political one.
  </p>
  <p>
    When Jama'at-e-Islami entered the electoral process in 1956, a group of individuals including Dr. Israr Ahmed resigned on account of their disagreement with the leadership of the Jama'at on significant policy matters. They came together and tried unsuccessfully to form an organized group that was expected to fulfill the vacuum created by the post-1947 change in the direction and course of Jama'at-e-Islami. A resolution was passed which subsequently became the Mission Statement of Tanzeem-e-Islami.
  </p>
  <p>
    While continuing his Quranic lectures, Dr. Israr kept waiting for his former colleagues to initiate efforts of Islamic renaissance through the revolutionary process. However, upon realizing that nobody was coming forward to shoulder this responsibility, he decided to step forward and call people to form a disciplined organization, thus laying the foundation of Tanzeem-e-Islami.
  </p>
  <h2>Key Milestones</h2>
  <ul>
    <li><strong>1975:</strong> Foundation of Tanzeem-e-Islami in Lahore.</li>
    <li><strong>1982:</strong> Launch of the Quran Academy for systematic Quranic education.</li>
    <li><strong>1991:</strong> Establishment of Markaz Tanzeem-e-Islami in Lahore.</li>
    <li><strong>2000s:</strong> Expansion through distance learning programs and online presence.</li>
    <li><strong>2010:</strong> Passing of Dr. Israr Ahmed; leadership transition to Shujauddin Sheikh.</li>
  </ul>
`;

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function BackgroundPage() {
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
    { name: "Background", path: "/organization/background" }
  ];

  return (
    <ModernizedProsePage
      title={page?.title || "Background"}
      excerpt={page?.excerpt || "The historical context and need for an Islamic revolutionary organization."}
      content={page?.content || DEFAULT_CONTENT}
      slug={SLUG}
      breadcrumbs={breadcrumbs}
      featuredImage={page?.featuredImage}
      ctaHeading="Learn About Our Mission"
      ctaSubheading="Discover how Tanzeem-e-Islami works toward the revival of Islam."
      ctaButtonLabel="Mission Statement"
      ctaButtonUrl="/organization/mission-statement"
    />
  );
}
