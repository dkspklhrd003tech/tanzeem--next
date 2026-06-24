import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ContactSection } from "@/components/shared/ContactSection";
import { db } from "@/lib/db";
import { settings, locations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { webPageJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SLUG = "contact";
const DEFAULT_TITLE = "Contact Us";
const DEFAULT_DESC =
  "Get in touch with Tanzeem-e-Islami. Find our contact details, office locations, and reach out to us with your queries.";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  if (page) return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
  return buildMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    path: "/contact",
    keywords: ["contact Tanzeem", "Tanzeem address", "Tanzeem phone", "Lahore Islamic centre"],
  });
}

export default async function ContactPage() {
  const { page, sections } = await getCmsPage(SLUG);

  // We ignore generic CMS content since Contact is a fully custom dynamic page.
  // ── Pull live data from DB and render ContactSection ──────────────
  const [settingsRows, locationRows] = await Promise.all([
    db
      .select()
      .from(settings)
      .where(eq(settings.group, "contact")),
    db
      .select()
      .from(locations)
      .where(eq(locations.isActive, true))
      .orderBy(asc(locations.name)),
  ]);

  // Flatten settings into a simple key→value map
  const contactSettings = settingsRows.reduce<Record<string, string>>(
    (acc, row) => { acc[row.key] = row.value; return acc; },
    {}
  );

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact Us", path: "/contact" },
  ]);
  const webpage = webPageJsonLd({ title: DEFAULT_TITLE, description: DEFAULT_DESC, path: "/contact" });

  return (
    <main className="min-h-screen bg-background">
      <script id="jsonld-contact-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script id="jsonld-contact-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <ContactSection
        contactSettings={contactSettings}
        locationRows={locationRows}
      />
    </main>
  );
}
