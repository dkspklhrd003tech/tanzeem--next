import { notFound } from "next/navigation";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Metadata } from "next";
import crypto from "crypto";
import { DynamicPageContent } from "@/components/shared/DynamicPageContent";
import { buildMetadata, webPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";

// ── Slug resolver — handles prefix mismatches (e.g. DB has "our-ideology"
//    but route provides "organization/our-ideology") ────────────────────────────
async function findPageBySlug(slug: string) {
    const candidates = [slug];
    if (slug.includes("/")) {
        candidates.push(slug.replace(/^[^/]+\//, ""));
    }
    if (!slug.startsWith("organization/")) {
        candidates.push(`organization/${slug}`);
    }
    for (const candidate of candidates) {
        const page = await db.query.pages.findFirst({
            where: eq(pages.slug, candidate),
        });
        if (page) return page;
    }
    return null;
}

// ── Seed Data for Dynamic Pages ───────────────────────────────────────────────
const SEED_DATA: Record<string, { title: string; content: string; excerpt: string }> = {
  "background": {
    title: "Background",
    excerpt: "The historical context and need for an Islamic revolutionary organization.",
    content: `
      <div class="space-y-6">
        <p class="text-xl md:text-2xl font-normal leading-relaxed text-foreground text-center max-w-3xl mx-auto mb-10">
          The essence of what we call the "Islamic revolutionary thought" consists of the idea that <strong>it is not enough to practice Islam in one's individual life but that the teachings of the Qur'an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life..</strong>
        </p>
        <p class="text-lg leading-relaxed text-foreground-muted">
          The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal. The first attempt towards the actualization of this concept was made by Maulana Abul Kalam Azad through his short-lived party, the Hizbullah. Another attempt was made by Maulana Sayyid Abul A\`la Maududi through his Jama\`at-e-Islami; however, the decision by the Jama\`at after the creation of Pakistan to take part in the electoral process instead of continuing the original revolutionary methodology gradually resulted in its degeneration from a pure Islamic revolutionary party to a mere political one.
        </p>
        <p class="text-lg leading-relaxed text-foreground-muted">
          When Jama't-e-Islami entered in the electoral process in 1956, a group of individuals including Dr. Israr Ahmed resigned on account of their disagreement with the leadership of the Jama'at on significant policy matters. They came together and tried unsuccessfully to form an organized group that was expected to fulfill the vacuum created by the post-1947 change in the direction and course of Jama't-e-Islami. A resolution was passed which subsequently became the Mission Statement of Tanzeem-e-Islami.
        </p>
        <p class="text-lg leading-relaxed text-foreground-muted">
          While continuing his Quranic lectures, Dr. Israr kept waiting for his former colleagues to initiate efforts of Islamic renaissance through the revolutionary process. However upon realizing that nobody was coming forward to shoulder this responsibility, he decided to step-on for this effort and call people to make a disciplined organization and he therefore laid the foundation of Tanzeem-e-Islami.
        </p>
      </div>
    `
  },
  "mission-statement": {
    title: "Mission Statement",
    excerpt: "The defined purpose and mission of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-foreground-muted">Our mission is to establish the Deen of Allah in its entirety, at all levels of human existence - individual as well as collective, societal as well as state.</p>
        <p class="text-lg leading-relaxed text-foreground-muted">We believe that the struggle to establish the Islamic system of social justice is the ultimate obligation of every Muslim in the present era, and this struggle must be carried out in an organized manner through a disciplined jamaat (party).</p>
        <div class="bg-primary/5 border border-primary/20 p-6 rounded-2xl mt-6">
          <h3 class="text-xl font-bold text-primary mb-4">Core Objectives</h3>
          <ul class="list-disc pl-6 space-y-2 text-lg text-foreground-muted">
              <li>To call people towards the deeply roots understanding of the Quran.</li>
              <li>To reform the lives of individuals to conform with the Sunnah.</li>
              <li>To form a disciplined organization of committed individuals.</li>
              <li>To struggle for the establishment of Khilafah.</li>
          </ul>
        </div>
      </div>
    `
  },
  "our-ideology": {
    title: "Our Ideology",
    excerpt: "An overview of the core ideology that forms the foundation of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-foreground-muted">The core ideology of Tanzeem-e-Islami stems from the pure and complete interpretation of Islam. We believe that Islam is not a mere set of rituals or a personal belief system, but a comprehensive Deen (system of life) designed by Allah to govern all aspects of human society.</p>
        <p class="text-lg leading-relaxed text-foreground-muted">We strive to revive the prophetic model of societal change, which begins with individual purification and moves toward collective revolution under a disciplined leadership.</p>
        <div class="grid md:grid-cols-2 gap-6 mt-8">
          <a href="/our-ideology/basic-belief" class="p-6 border border-border rounded-xl hover:border-primary/50 transition-colors bg-card hover:bg-muted/10">
            <h3 class="font-bold text-lg text-primary mb-2">Basic Belief</h3>
            <p class="text-sm text-foreground-muted">Explore our foundational beliefs regarding the sovereignty of Allah and the role of humanity.</p>
          </a>
          <a href="/our-ideology/our-obligations" class="p-6 border border-border rounded-xl hover:border-primary/50 transition-colors bg-card hover:bg-muted/10">
            <h3 class="font-bold text-lg text-primary mb-2">Our Obligations</h3>
            <p class="text-sm text-foreground-muted">Learn about the religious obligations binding upon every Muslim in the modern world.</p>
          </a>
          <a href="/our-ideology/methodology" class="p-6 border border-border rounded-xl hover:border-primary/50 transition-colors bg-card hover:bg-muted/10">
            <h3 class="font-bold text-lg text-primary mb-2">Methodology</h3>
            <p class="text-sm text-foreground-muted">Understand the prophetic methodology for Islamic revolution and reform.</p>
          </a>
          <a href="/our-ideology/foundation" class="p-6 border border-border rounded-xl hover:border-primary/50 transition-colors bg-card hover:bg-muted/10">
            <h3 class="font-bold text-lg text-primary mb-2">Foundation</h3>
            <p class="text-sm text-foreground-muted">Discover the historical foundation and establishment of Tanzeem-e-Islami.</p>
          </a>
        </div>
      </div>
    `
  },
  "our-ideology/basic-belief": {
    title: "Basic Belief",
    excerpt: "The basic theological and ideological beliefs of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-foreground-muted">At the center of our belief is the absolute sovereignty of Allah (Tawheed) over all aspects of creation, including governance and legislation. No human authority, assembly, or king has the right to legislate in defiance of the Quran and Sunnah.</p>
        <p class="text-lg leading-relaxed text-foreground-muted">We believe that accepting any authority other than Allah as supreme is a form of Shirk (associating partners with Allah), and that the primary duty of the Prophets was to free mankind from the subjugation of other humans and bring them under the sole obedience of their Creator.</p>
      </div>
    `
  },
  "our-ideology/our-obligations": {
    title: "Our Obligations",
    excerpt: "The critical obligations of Muslims regarding the establishment of Deen.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-foreground-muted">According to the Quran, the obligations of a Muslim are not limited to personal worship. Every Muslim is obligated to actively participate in the struggle to make the word of Allah supreme (Iqamat-e-Deen).</p>
        <p class="text-lg leading-relaxed text-foreground-muted">This obligation requires two distinct dimensions:</p>
        <ul class="list-decimal pl-6 space-y-3 text-lg text-foreground-muted">
          <li><strong>Individual Level:</strong> Obeying Allah's commands in personal life, including prayer, fasting, character, and business transactions.</li>
          <li><strong>Collective Level:</strong> Cooperating with other believers in an organized body (Jamaat) to challenge falsehood and establish the divine order in the public sphere.</li>
        </ul>
      </div>
    `
  },
  "our-ideology/methodology": {
    title: "Methodology",
    excerpt: "The prophetic methodology for Islamic revolution and reform.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-foreground-muted">Our methodology is derived directly from the Seerah (biography) of Prophet Muhammad (PBUH) during the Makkan and early Madinan periods. This methodology is peaceful, educational, and revolutionary, avoiding any underground or militant struggle.</p>
        <p class="text-lg leading-relaxed text-foreground-muted">The core phases of our struggle are:</p>
        <ul class="list-disc pl-6 space-y-2 text-lg text-foreground-muted">
          <li><strong>Da'wah:</strong> Calling people to the Quran and clarifying the true nature of Deen.</li>
          <li><strong>Tazkiyah:</strong> Purification of the souls and minds of those who respond.</li>
          <li><strong>Tanzeem:</strong> Organizing them into a highly disciplined and structured Jamaat.</li>
          <li><strong>Sabar-e-Jameel:</strong> Bearing all hardships and persecutions patiently without retaliation.</li>
          <li><strong>Revolutionary Action:</strong> Challenging the system through peaceful defiance when the cadre is ready.</li>
        </ul>
      </div>
    `
  },
  "our-ideology/foundation": {
    title: "Foundation",
    excerpt: "The historical foundation and establishment of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-foreground-muted">The foundation of Tanzeem-e-Islami was laid in 1975 by Dr. Israr Ahmed along with a small group of dedicated companions who felt the urgent need for a structured effort to re-establish the Islamic system in Pakistan and beyond.</p>
        <p class="text-lg leading-relaxed text-foreground-muted">The foundation stone was laid with a commitment to listen and obey (Bai'ah) the Ameer in all matters conforming to the Shari'ah, restoring the early Islamic model of organization.</p>
      </div>
    `
  }
};

/**
 * ISR — revalidate every 5 minutes.
 * Pages are cached at the edge and rebuilt in the background when stale.
 * Individual pages can also be purged via revalidatePath() in the admin.
 */
export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug: slugArray } = await params;
    const slug = slugArray.join("/");

    let page = await findPageBySlug(slug);

    if (!page && SEED_DATA[slug]) {
        const user = await db.query.users.findFirst();
        if (user) {
            try {
                await db.insert(pages).values({
                    id: crypto.randomUUID(),
                    title: SEED_DATA[slug].title,
                    slug: slug,
                    content: SEED_DATA[slug].content,
                    excerpt: SEED_DATA[slug].excerpt,
                    featuredImage: null,
                    template: "default",
                    parentId: null,
                    order: 0,
                    isPublished: true,
                    showInMenu: true,
                    metaTitle: null,
                    metaDescription: null,
                    metaKeywords: null,
                    canonicalUrl: null,
                    ogImage: null,
                    schemaType: "WebPage",
                    noIndex: false,
                    authorId: user.id,
                    publishedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } catch (err) {
                console.warn(`Concurrent seeding insert for slug '${slug}' caught:`, err);
            }
            page = await findPageBySlug(slug);
        }
    }

    if (!page || !page.isPublished) return { title: "Page Not Found" };

    return buildMetadata({
        title: page.metaTitle ?? page.title,
        description: page.metaDescription ?? page.excerpt ?? undefined,
        path: `/${slug}`,
        ogImage: (page as any).ogImage ?? page.featuredImage ?? null,
        noIndex: (page as any).noIndex ?? false,
    });
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function DynamicPage({ params }: PageProps) {
    const { slug: slugArray } = await params;
    const slug = slugArray.join("/");

    let page = await findPageBySlug(slug);

    if (!page && SEED_DATA[slug]) {
        const user = await db.query.users.findFirst();
        if (user) {
            try {
                await db.insert(pages).values({
                    id: crypto.randomUUID(),
                    title: SEED_DATA[slug].title,
                    slug: slug,
                    content: SEED_DATA[slug].content,
                    excerpt: SEED_DATA[slug].excerpt,
                    featuredImage: null,
                    template: "default",
                    parentId: null,
                    order: 0,
                    isPublished: true,
                    showInMenu: true,
                    metaTitle: null,
                    metaDescription: null,
                    metaKeywords: null,
                    canonicalUrl: null,
                    ogImage: null,
                    schemaType: "WebPage",
                    noIndex: false,
                    authorId: user.id,
                    publishedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } catch (err) {
                console.warn(`Concurrent seeding insert for slug '${slug}' caught:`, err);
            }
            page = await findPageBySlug(slug);
        }
    }

    if (!page || !page.isPublished) notFound();

    const sections = await db.query.pageSections.findMany({
        where: and(
            eq(pageSections.pageId, page.id),
            eq(pageSections.isActive, true)
        ),
        orderBy: (s, { asc }) => [asc(s.order)],
    });

    // Build JSON-LD for this page
    const webpage = webPageJsonLd({
        title: page.metaTitle ?? page.title,
        description: page.metaDescription ?? page.excerpt ?? undefined,
        path: `/${slug}`,
        datePublished: page.publishedAt,
        dateModified: page.updatedAt,
    });

    const crumbs = [
        { name: "Home", path: "/" },
        ...slugArray.map((seg, i) => ({
            name: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
            path: "/" + slugArray.slice(0, i + 1).join("/"),
        })),
    ];
    const bc = breadcrumbJsonLd(crumbs);

    const ldId = slug.replace(/\//g, "-");

    // Map specialized configurations for dynamic subpages
    let stats: any = undefined;
    let accordionItems: any = undefined;
    let ideologyCards: any = undefined;
    let ctaHeading: string | undefined = undefined;
    let ctaSubheading: string | undefined = undefined;
    let ctaButtonLabel: string | undefined = undefined;
    let ctaButtonUrl: string | undefined = undefined;

    const normalizedSlug = slug.replace(/^organization\//, "");

    if (normalizedSlug === "background") {
        ctaHeading = "Learn About Our Mission";
        ctaSubheading = "Discover how Tanzeem-e-Islami works toward the revival of Islam.";
        ctaButtonLabel = "Mission Statement";
        ctaButtonUrl = "/organization/mission-statement";
    } else if (normalizedSlug === "mission-statement") {
        stats = [
            { number: "1975", label: "Founded" },
            { number: "50+", label: "Years of Service" },
            { number: "100+", label: "Dars-e-Quran Circles" },
            { number: "Global", label: "Reach" },
        ];
        ctaHeading = "Explore Our Ideology";
        ctaSubheading = "Learn about the beliefs and principles that guide our work.";
        ctaButtonLabel = "Our Ideology";
        ctaButtonUrl = "/organization/our-ideology";
    } else if (normalizedSlug === "our-ideology") {
        ideologyCards = [
            { title: "Basic Belief", href: "/organization/our-ideology/basic-belief", description: "Fundamental Islamic beliefs and principles" },
            { title: "Our Obligations", href: "/organization/our-ideology/our-obligations", description: "Our duties and responsibilities as Muslims" },
            { title: "Methodology", href: "/organization/our-ideology/methodology", description: "Our approach and method of work" },
            { title: "Foundation", href: "/organization/our-ideology/foundation", description: "The foundational principles of our movement" },
        ];
    } else if (normalizedSlug === "our-ideology/basic-belief") {
        accordionItems = [
            {
                question: "Tawheed (Oneness of Allah)",
                answer: "We believe in the absolute oneness of Allah (SWT). He is the Creator, Sustainer, and Sovereign of the universe. No one is worthy of worship except Him. This fundamental belief forms the bedrock of our faith and worldview.",
            },
            {
                question: "Risalah (Prophethood)",
                answer: "We believe in all the prophets of Allah, from Adam (AS) to Muhammad (SAW). Prophet Muhammad (SAW) is the final messenger, and his Sunnah is the ultimate practical model for human guidance. We believe that the Quran was revealed to him as the final and complete guidance for humanity.",
            },
            {
                question: "Akhirah (Hereafter)",
                answer: "We firmly believe in the Day of Judgment when all of humanity will be resurrected and held accountable for their deeds. This belief instills a deep sense of responsibility and moral consciousness in every aspect of our lives.",
            },
            {
                question: "The Quran as Complete Guidance",
                answer: "We believe that the Holy Quran is not just a book of worship but a complete constitution for human life. It provides guidance for all spheres of life including spiritual, social, economic, political, and cultural aspects.",
            },
            {
                question: "Sunnah as Practical Model",
                answer: "The Sunnah of Prophet Muhammad (SAW) provides the practical interpretation and application of Quranic teachings. We strive to follow the Sunnah in all aspects of our lives as the perfect model of Islamic conduct.",
            },
            {
                question: "Shahada — The Declaration of Faith",
                answer: "The declaration 'La ilaha illallah, Muhammadur Rasulullah' (There is no god but Allah, and Muhammad is His messenger) is the foundation of Islamic faith and the entry point into the fold of Islam.",
            },
        ];
    } else if (normalizedSlug === "our-ideology/methodology") {
        stats = [
            { number: "Tazkiyah", label: "Purification of Self" },
            { number: "Tarbiyah", label: "Intellectual Training" },
            { number: "Dawah", label: "Invitation to Islam" },
            { number: "Jihad", label: "Struggle for Islam" },
        ];
    } else if (normalizedSlug === "our-ideology/foundation") {
        ctaHeading = "Meet Our Founder";
        ctaSubheading = "Learn about Dr. Israr Ahmed, the visionary founder of Tanzeem-e-Islami.";
        ctaButtonLabel = "The Founder";
        ctaButtonUrl = "/organization/the-founder";
    }

    return (
        <>
            {/* Structured data */}
            <script
                id={`jsonld-page-${ldId}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }}
            />
            <script
                id={`jsonld-bc-${ldId}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }}
            />

            {/* Section-builder content (all 15 section types supported) */}
            {sections.length > 0 ? (
                <DynamicPageContent sections={sections as any} />
            ) : (
                <ModernizedProsePage
                    title={page.title}
                    excerpt={page.excerpt}
                    content={page.content}
                    slug={slug}
                    breadcrumbs={crumbs}
                    featuredImage={page.featuredImage}
                    stats={stats}
                    accordionItems={accordionItems}
                    ideologyCards={ideologyCards}
                    ctaHeading={ctaHeading}
                    ctaSubheading={ctaSubheading}
                    ctaButtonLabel={ctaButtonLabel}
                    ctaButtonUrl={ctaButtonUrl}
                />
            )}
        </>
    );
}
