import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { TeamGrid } from "@/components/shared/TeamGrid";
import { CTABanner } from "@/components/shared/CTABanner";

const SLUG = "organization/the-ameer";
const DEFAULT_TITLE = "The Ameer | Tanzeem-e-Islami";
const FALLBACK_MEMBERS = [
  {
    name: "Shujauddin Sheikh",
    designation: "Ameer of Tanzeem-e-Islami",
    bio: "Mohtaram Shujauddin Shaikh is the current Ameer (leader) of Tanzeem-e-Islami, who assumed leadership in 2020.",
    avatar: "https://tanzeem.org/media/shujauddin-sheikh.jpg",
    socials: { website: "https://tanzeem.org/shujauddin-sheikh" },
  },
];

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function AmeerPage() {
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
          <h1>The Ameer</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Shujauddin Sheikh &mdash; Current Ameer of Tanzeem-e-Islami, guiding the organization&apos;s vision and activities in the contemporary era.
          </p>
          <TeamGrid heading="Ameer" members={FALLBACK_MEMBERS} />
          <h2>Leadership</h2>
          <p>Shujauddin Sheikh was born on September 29, 1974. He assumed the leadership of Tanzeem-e-Islami in 2020.</p>
          <h2>Vision and Approach</h2>
          <ul>
            <li>Expanding digital outreach through modern media platforms</li>
            <li>Strengthening the Dars-e-Quran network globally</li>
            <li>Engaging with contemporary issues from an Islamic perspective</li>
            <li>Building bridges with other Islamic movements and organizations</li>
            <li>Developing youth leadership programs</li>
          </ul>
          <h2>Message to the Ummah</h2>
          <p>The Ameer emphasizes the need for Muslims to unite on the basis of their shared faith and to work collectively for the revival of Islam.</p>
        </article>
      </div>
      <CTABanner
        heading="Learn About Our Mission"
        subheading="Discover the mission that guides Tanzeem-e-Islami."
        buttonLabel="Mission Statement"
        buttonUrl="/organization/mission-statement"
      />
    </main>
  );
}
