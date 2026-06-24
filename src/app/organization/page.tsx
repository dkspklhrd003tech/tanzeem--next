import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import OrganizationPageClient from "@/components/organization/OrganizationPage";
import { IdeologySection } from "@/components/organization/IdeologySection";
import { HubLanding } from "@/components/shared/HubLanding";
import { db } from "@/lib/db";
import { pageSections, pages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { webPageJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SLUG = "organization";
const DEFAULT_TITLE = "Organization";
const DEFAULT_DESC = "Learn about Tanzeem-e-Islami's history, mission, ideology, and leadership.";

const FALLBACK_CARDS = [
  {
    title: "Background",
    href: "/organization/background",
    description: "History and founding of Tanzeem-e-Islami",
  },
  {
    title: "Mission Statement",
    href: "/organization/mission-statement",
    description: "Our mission and purpose",
  },
  {
    title: "Our Ideology",
    href: "/organization/our-ideology",
    description: "Beliefs, obligations, methodology, and foundation",
  },
  {
    title: "The Founder",
    href: "/organization/the-founder",
    description: "Dr. Israr Ahmed (1932–2010)",
  },
  {
    title: "The Ameer",
    href: "/organization/the-ameer",
    description: "Shujauddin Sheikh — current leadership",
  },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  if (page) return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
  return buildMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    path: "/organization",
    keywords: ["Tanzeem organization", "Dr. Israr Ahmed", "Islamic movement", "Khilafah"],
  });
}

export default async function OrganizationPage() {
  const { page, sections } = await getCmsPage(SLUG);

  // ── CMS full page with sections ───────────────────────────────────────────
  if (page && sections.length > 0) {
    return (
      <main className="min-h-screen bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  // ── CMS page with raw HTML content ────────────────────────────────────────
  if (page && page.content?.trim()) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-6 md:py-8 max-w-4xl">
          <div
            className="prose prose-lg dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  // ── Client-side state-driven page (from localStorage / site manager) ──────
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Organization", path: "/organization" },
  ]);
  const webpage = webPageJsonLd({ title: DEFAULT_TITLE, description: DEFAULT_DESC, path: "/organization" });

  return (
    <>
      <script id="jsonld-org-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script id="jsonld-org-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <OrganizationPageClient />
    </>
  );
}
