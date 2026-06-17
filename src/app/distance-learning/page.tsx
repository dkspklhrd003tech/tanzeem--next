import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";

const SLUG = "distance-learning";
const DEFAULT_TITLE = "Distance Learning | Tanzeem-e-Islami";
const DEFAULT_DESC = "Study the Quran, Hadith, and Islamic sciences from anywhere in the world through our distance learning programs.";
const FALLBACK_CARDS = [
  { title: "Bayan-ul-Quran", href: "/resources/bayan-ul-quran", description: "Comprehensive Quran commentary and study program" },
  { title: "Dars-e-Quran", href: "/darse-quran", description: "Systematic Quran study circles" },
  { title: "Online Courses", href: "/online-courses", description: "Structured online Islamic education courses" },
  { title: "Quran Academies", href: "/quranic-circles", description: "Quranic education and training programs" },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function DistanceLearningPage() {
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
        <div className="container mx-auto py-12 md:py-16 px-4">
          <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto"
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
          <h1>Distance Learning</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Study the Quran, Hadith, and Islamic sciences from anywhere in the world through our distance learning programs.
          </p>
          <h2>Our Education Philosophy</h2>
          <p>Tanzeem-e-Islami believes that the revival of Islam begins with the revival of Quranic education.</p>
          <h2>Available Programs</h2>
          <h3>Bayan-ul-Quran</h3>
          <p>A comprehensive program for the systematic study of the Quran with Tafseer.</p>
          <h3>Dars-e-Quran</h3>
          <p>Regular Quran study circles conducted at various locations and online.</p>
          <h3>Online Courses</h3>
          <p>Structured online courses covering various Islamic sciences including Tafseer, Hadith, Fiqh, and Islamic history.</p>
          <h3>Tasheel-ul-Quran</h3>
          <p>A simplified Quran study program designed for beginners and those with limited time.</p>
        </article>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {FALLBACK_CARDS.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
