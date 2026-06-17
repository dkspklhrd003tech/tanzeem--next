import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { CTABanner } from "@/components/shared/CTABanner";

const SLUG = "organization/background";
const DEFAULT_TITLE = "Background | Tanzeem-e-Islami";

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
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Background</h1>
          <p>
            Tanzeem-e-Islami is an Islamic revivalist movement founded in 1975 by the eminent Islamic scholar
            Dr. Israr Ahmed (1932&ndash;2010). The organization emerged from a deep concern about the Muslim Ummah&apos;s
            political, social, and spiritual decline and a firm belief that the only solution lies in a comprehensive
            return to the original sources of Islam &mdash; the Quran and the Sunnah.
          </p>
          <h2>Historical Context</h2>
          <p>
            The mid-20th century saw the Muslim world grappling with the aftermath of colonialism, the rise of
            secular nationalism, and the fragmentation of Islamic unity. In the Indian subcontinent, the creation
            of Pakistan in 1947 raised hopes for an Islamic renaissance, but soon the nation-state model drifted
            toward secularism and Westernization. Dr. Israr Ahmed, who had been deeply influenced by the teachings
            of Allama Iqbal and Maulana Maududi, felt that the intellectual and spiritual revival of Islam required
            a dedicated cadre of workers (kaar-kun) who would devote their lives to the cause of Islam.
          </p>
          <h2>The Founding of Tanzeem-e-Islami</h2>
          <p>
            In 1975, Dr. Israr Ahmed laid the foundation of Tanzeem-e-Islami with a small group of like-minded
            individuals who shared his vision. Unlike mass-based political parties, Tanzeem-e-Islami was conceived
            as a nucleus or a &ldquo;party of the committed&rdquo; (jamat-ul-momineen) &mdash; an elite group of dedicated workers
            who would first internalize the Islamic faith in its totality and then work toward the establishment of
            the Islamic System (Nizam-e-Mustafa) in society.
          </p>
          <h2>Key Milestones</h2>
          <ul>
            <li><strong>1975:</strong> Foundation of Tanzeem-e-Islami in Lahore</li>
            <li><strong>1982:</strong> Launch of the Quran Academy for systematic Quranic education</li>
            <li><strong>1991:</strong> Establishment of Markaz Tanzeem-e-Islami in Lahore</li>
            <li><strong>2000s:</strong> Expansion through distance learning programs and online presence</li>
            <li><strong>2010:</strong> Passing of Dr. Israr Ahmed; leadership transition to Shujauddin Sheikh</li>
          </ul>
        </article>
      </div>
      <CTABanner
        heading="Learn About Our Mission"
        subheading="Discover how Tanzeem-e-Islami works toward the revival of Islam."
        buttonLabel="Mission Statement"
        buttonUrl="/organization/mission-statement"
      />
    </main>
  );
}
