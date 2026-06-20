import { getCmsPage } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/our-ideology";
const DEFAULT_TITLE = "Our Ideology | Tanzeem-e-Islami";

const DEFAULT_CONTENT = `
  <p>
    The core ideology of Tanzeem-e-Islami stems from the pure and complete interpretation of Islam. We believe that Islam is not a mere set of rituals or a personal belief system, but a comprehensive Deen (system of life) designed by Allah to govern all aspects of human society.
  </p>
  <p>
    We strive to revive the prophetic model of societal change, which begins with individual purification and moves toward collective revolution under a disciplined leadership.
  </p>
  <h2>Core Ideology Areas</h2>
  <p>
    Our ideology is structured across four primary dimensions: our basic beliefs regarding Allah's absolute sovereignty, our obligations in the modern era, the methodology of prophetic struggle, and the historical foundation of our organization.
  </p>
`;

const FALLBACK_CARDS = [
  { title: "Basic Belief", href: "/organization/our-ideology/basic-belief", description: "Fundamental Islamic beliefs and principles" },
  { title: "Our Obligations", href: "/organization/our-ideology/our-obligations", description: "Our duties and responsibilities as Muslims" },
  { title: "Methodology", href: "/organization/our-ideology/methodology", description: "Our approach and method of work" },
  { title: "Foundation", href: "/organization/our-ideology/foundation", description: "The foundational principles of our movement" },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function IdeologyHubPage() {
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
    { name: "Our Ideology", path: "/organization/our-ideology" }
  ];

  return (
    <ModernizedProsePage
      title={page?.title || "Our Ideology"}
      excerpt={page?.excerpt || "Explore the beliefs, obligations, methodology, and foundation of Tanzeem-e-Islami."}
      content={page?.content || DEFAULT_CONTENT}
      slug={SLUG}
      breadcrumbs={breadcrumbs}
      featuredImage={page?.featuredImage}
      ideologyCards={FALLBACK_CARDS}
    />
  );
}
