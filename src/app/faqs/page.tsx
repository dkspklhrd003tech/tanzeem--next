import { db } from "@/db";
import { faqItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCmsPage } from "@/lib/page-helpers";
import { generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { FAQPageClient, type FAQItem } from "@/components/faq/FAQPageClient";

export const dynamic = "force-dynamic";

const SLUG = "faqs";
const DEFAULT_TITLE = "FAQs | Tanzeem-e-Islami";
const DEFAULT_DESC = "Frequently asked questions about Tanzeem-e-Islami, its mission, programs, and activities.";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function FAQsPage() {
  const { page } = await getCmsPage(SLUG);

  let items: any[] = [];
  try {
    items = await db
      .select()
      .from(faqItems)
      .where(eq(faqItems.isPublished, true))
      .orderBy(faqItems.order);
  } catch (error) {
    console.error("Failed to query faqItems:", error);
  }

  // Map dynamic database items
  const formattedItems: FAQItem[] = items.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    category: item.category || "General",
    order: item.order || 0,
    isPublished: item.isPublished,
  }));

  return (
    <FAQPageClient
      initialItems={formattedItems}
      pageTitle={page?.title || "Frequently Asked Questions"}
      pageExcerpt={page?.excerpt || undefined}
    />
  );
}

