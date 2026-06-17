import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { Accordion } from "@/components/shared/Accordion";

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
  const { page, sections } = await getCmsPage(SLUG);

  if (page && sections.length > 0) {
    return (
      <main className="min-h-screen bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  if (page) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-12 md:py-16 px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto mb-12">
          <h1>Frequently Asked Questions</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            {DEFAULT_DESC}
          </p>
        </article>
        <div className="max-w-3xl mx-auto">
          <Accordion items={FALLBACK_ITEMS} />
        </div>
      </div>
    </main>
  );
}
