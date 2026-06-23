import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

export const dynamic = "force-dynamic";

const SLUG = "organization/the-founder";
const DEFAULT_TITLE = "The Founder | Tanzeem-e-Islami";

const FALLBACK_FOUNDER = {
  title: "Dr. Israr Ahmed",
  excerpt: "APRIL 26, 1932 – APRIL 14, 2010",
  featuredImage: "/uploads/40384275-a53c-4bdb-8134-d748eb00d88c-founder.webp",
  slug: SLUG,
  content: `
    <p>Dr. Israr Ahmad, the second son of a government servant, was born on April 26, 1932 in Hisar (a district of East Punjab, now a part of Haryana) in India. He graduated from King Edward Medical College (Lahore) in 1954 and later received his masters in Islamic Studies from the University of Karachi in 1965. He came under the influence of Allama Iqbal and Maulana Abul A\`la Maududi as a young student, worked briefly for Muslim Student’s Federation in the Independence Movement and, following the creation of Pakistan in 1947, for the Islami Jami\`yat-e-Talaba and then for the Jama\`at-e-Islami.</p>
    
    <p>Dr. Israr Ahmad resigned from the Jama\`at in April 1957 because of its involvement in the electoral politics, which he believed was irreconcilable with the revolutionary methodology adopted by the Jama’at in the pre-1947 period. While still a student and an activist of the Islami Jami\`yat-e-Talaba, Dr. Israr Ahmad gained considerable fame and eminence as a Mudarris (or teacher) of the Holy Qur’an.</p>
    
    <p>Even after resigning from the Jama\`at, he continued to give Qur’anic lectures in different cities of Pakistan, and especially after 1965 he has, according to his own disclosure, invested the better part of his physical and intellectual abilities in the learning and teaching of the Qur’an’ic wisdom.</p>
    
    <p>Dr. Israr Ahmad wrote an extremely significant tract in 1967 in which he explained his basic thought — that an Islamic Renaissance is possible only by revitalizing the Iman (true faith and conviction) among the Muslims, particularly their intelligentsia. The revitalization of Iman, in turn, is possible only by the propagation of the Qur’an’ic teachings and the study of the Qur’an in modern terms.</p>
  `.trim()
};

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE);
}

export default async function FounderPage() {
  const { page, sections } = await getCmsPage(SLUG);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Organization", path: "/organization" },
    { name: "The Founder", path: "/organization/the-founder" },
  ];

  if (page && page.template !== "leader" && sections.length > 0) {
    return (
      <main className="min-h-screen bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  if (page) {
    return (
      <ModernizedProsePage
        title={page.title}
        excerpt={page.excerpt}
        content={getCleanContent(page.content)}
        slug={page.slug}
        breadcrumbs={crumbs}
        featuredImage={page.featuredImage}
        template={page.template}
        ctaHeading="Meet Our Ameer"
        ctaSubheading="Discover the current Ameer of Tanzeem-e-Islami and read his profile."
        ctaButtonLabel="The Ameer"
        ctaButtonUrl="/organization/the-ameer"
      />
    );
  }

  // Fallback if DB record doesn't exist
  return (
    <ModernizedProsePage
      title={FALLBACK_FOUNDER.title}
      excerpt={FALLBACK_FOUNDER.excerpt}
      content={FALLBACK_FOUNDER.content}
      slug={FALLBACK_FOUNDER.slug}
      breadcrumbs={crumbs}
      featuredImage={FALLBACK_FOUNDER.featuredImage}
      template="leader"
      ctaHeading="Meet Our Ameer"
      ctaSubheading="Discover the current Ameer of Tanzeem-e-Islami and read his profile."
      ctaButtonLabel="The Ameer"
      ctaButtonUrl="/organization/the-ameer"
    />
  );
}
