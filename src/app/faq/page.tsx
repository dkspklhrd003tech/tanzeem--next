import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FAQWithTabs, type FAQEntry } from "@/components/faq/FAQWithTabs";

export const metadata = { title: "FAQs | Tanzeem-e-Islami" };

export const dynamic = "force-dynamic";

const defaultFaqs: FAQEntry[] = [
  {
    id: "1",
    category: "General",
    question: "What is Tanzeem-e-Islami?",
    answer:
      "Tanzeem-e-Islami is an Islamic revivalist movement working to establish the Deen of Allah through Quranic guidance and the Sunnah of Prophet Muhammad (SAWS).",
  },
  {
    id: "2",
    category: "General",
    question: "Who founded Tanzeem-e-Islami?",
    answer:
      "The movement was founded by Dr. Israr Ahmed (1932–2010), a renowned Islamic scholar who dedicated his life to Quranic education and the revival of Islam.",
  },
  {
    id: "3",
    category: "Membership",
    question: "How can I join Tanzeem?",
    answer:
      "Visit the Join Tanzeem page or submit an application at app.dhtr.org/contactus. Local coordinators will guide you through the process.",
  },
  {
    id: "4",
    category: "Programs",
    question: "What are Quranic Circles?",
    answer:
      "Weekly study circles where members collectively study the Quran and Islamic literature under trained coordinators in cities across Pakistan.",
  },
  {
    id: "5",
    category: "Resources",
    question: "Where can I access Dr. Israr Ahmed's lectures?",
    answer:
      "Browse our Audio and Video libraries, or visit drisrar.com and our official YouTube channels linked under Resources → Videos.",
  },
];

export default async function FAQPage() {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, "faq"),
  });

  return (
    <div className="container mx-auto py-12 md:py-16 px-4 max-w-3xl">
      <h1 className="font-amiri text-3xl font-bold text-primary mb-2">Frequently Asked Questions</h1>
      <p className="text-foreground-muted mb-8">
        Common questions about Tanzeem-e-Islami, its mission, and programs.
      </p>
      {page?.content && !page.content.includes("<h1>FAQs</h1>") ? (
        <div className="dynamic-content prose-tanzeem mb-8" dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : null}
      <FAQWithTabs items={defaultFaqs} />
    </div>
  );
}
