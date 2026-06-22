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

const FALLBACK_ITEMS = [
  {
    question: "What is Tanzeem-e-Islami?",
    answer: "Tanzeem-e-Islami is an Islamic revivalist movement founded in 1975 by Dr. Israr Ahmed. It works for the establishment of the Islamic system (Nizam-e-Mustafa) in all aspects of human life through education, training, and dawah.",
  },
  {
    question: "Who is the current leader of Tanzeem-e-Islami?",
    answer: "Shujauddin Sheikh is the current Ameer (leader) of Tanzeem-e-Islami, who assumed leadership in 2020 following the organization's Shura-based selection process.",
  },
  {
    question: "How can I join Tanzeem-e-Islami?",
    answer: "You can join Tanzeem-e-Islami by contacting your local chapter or Markaz Tanzeem in Lahore. The membership process involves a commitment to study the Quran, participate in organizational activities, and work for the revival of Islam.",
  },
  {
    question: "What is Dars-e-Quran?",
    answer: "Dars-e-Quran is the flagship educational program of Tanzeem-e-Islami — systematic Quran study circles conducted regularly at various locations across Pakistan and globally, focusing on understanding the Quran's message and its practical application.",
  },
  {
    question: "Are women welcome to participate?",
    answer: "Yes, many Dars-e-Quran circles have separate arrangements for ladies. Please contact your local chapter or Markaz Tanzeem for specific details about ladies' participation.",
  },
  {
    question: "How can I access Tanzeem-e-Islami's publications?",
    answer: "All publications including books, magazines (Meesaq, Hikmat-e-Quran, Nida-e-Khilafat, Perspective), and press releases are available on our website under the Resources section.",
  },
  {
    question: "Does Tanzeem-e-Islami offer online education?",
    answer: "Yes, Tanzeem-e-Islami offers distance learning programs and online courses through the Quran Academy LMS. Visit our Online Courses page for more information.",
  },
  {
    question: "How can I donate to Tanzeem-e-Islami?",
    answer: "For donation inquiries, please contact Markaz Tanzeem directly at markaz@tanzeem.org or call +92 (42) 35473375-78.",
  },
];

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

  // Map dynamic database items or use mapped fallback items
  const formattedItems: FAQItem[] = items.length > 0
    ? items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: item.category || "General",
        order: item.order || 0,
        isPublished: item.isPublished,
      }))
    : FALLBACK_ITEMS.map((item, idx) => ({
        id: `fallback-${idx}`,
        question: item.question,
        answer: item.answer,
        category: "General",
        order: idx,
        isPublished: true,
      }));

  return (
    <FAQPageClient
      initialItems={formattedItems}
      pageTitle={page?.title || "Frequently Asked Questions"}
      pageExcerpt={page?.excerpt || undefined}
    />
  );
}

