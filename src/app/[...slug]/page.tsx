import { notFound, redirect, permanentRedirect } from "next/navigation";
import { db } from "@/db";
import { pages, pageSections, audioCategories, videoCategories, audio, videos, speakers, bookCategories, books, settings } from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { Metadata } from "next";
import crypto from "crypto";
import { DynamicPageContent } from "@/components/shared/DynamicPageContent";
import { buildMetadata, webPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";
import { RedirectPage } from "@/components/shared/RedirectPage";
import { NestedCategoryGrid } from "@/components/shared/NestedCategoryGrid";
import { MediaCardGrid } from "@/components/shared/MediaCardGrid";
import { PublicationGrid } from "@/components/shared/PublicationGrid";
import { AudioListClient } from "@/components/shared/AudioListClient";
import { VideoListClient } from "@/components/shared/VideoListClient";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";

// ── Slug resolver — handles prefix mismatches (e.g. DB has "our-ideology"
//    but route provides "organization/our-ideology") ────────────────────────────
async function findPageBySlug(slug: string) {
  const candidates = [
    slug,
    `/${slug}`,
    slug.replace(/^\//, "")
  ];
  if (slug.includes("/")) {
    candidates.push(slug.replace(/^[^/]+\//, ""));
  }
  if (!slug.startsWith("organization/")) {
    candidates.push(`organization/${slug}`);
    candidates.push(`/organization/${slug}`);
  }

  const uniqueCandidates = Array.from(new Set(candidates));

  try {
    for (const candidate of uniqueCandidates) {
      const page = await db.query.pages.findFirst({
        where: eq(pages.slug, candidate),
      });
      if (page) return page;
    }
  } catch (error) {
    console.warn("DB error in findPageBySlug:", error);
  }
  return null;
}

// ── Seed Data for Dynamic Pages ───────────────────────────────────────────────
const SEED_DATA: Record<string, { title: string; content: string; excerpt: string; template?: string }> = {
  "organization/background": {
    title: "Background",
    excerpt: "The historical context and need for an Islamic revolutionary organization.",
    content: `
      <div class="space-y-6">
        <p class="text-xl  font-normal bg-primary-light p-6 rounded-sm text-center max-w-3xl mx-auto mb-10">
          The essence of what we call the "Islamic revolutionary thought" consists of the idea that <strong>it is not enough to practice Islam in one's individual life but that the teachings of the Qur'an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life..</strong>
        </p>
        <p class="text-lg leading-relaxed text-[#222222]">
          The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal. The first attempt towards the actualization of this concept was made by Maulana Abul Kalam Azad through his short-lived party, the Hizbullah. Another attempt was made by Maulana Sayyid Abul A\`la Maududi through his Jama\`at-e-Islami; however, the decision by the Jama\`at after the creation of Pakistan to take part in the electoral process instead of continuing the original revolutionary methodology gradually resulted in its degeneration from a pure Islamic revolutionary party to a mere political one.
        </p>
        <p class="text-lg leading-relaxed text-[#222222]">
          When Jama't-e-Islami entered in the electoral process in 1956, a group of individuals including Dr. Israr Ahmed resigned on account of their disagreement with the leadership of the Jama'at on significant policy matters. They came together and tried unsuccessfully to form an organized group that was expected to fulfill the vacuum created by the post-1947 change in the direction and course of Jama't-e-Islami. A resolution was passed which subsequently became the Mission Statement of Tanzeem-e-Islami.
        </p>
        <p class="text-lg leading-relaxed text-[#222222]">
          While continuing his Quranic lectures, Dr. Israr kept waiting for his former colleagues to initiate efforts of Islamic renaissance through the revolutionary process. However upon realizing that nobody was coming forward to shoulder this responsibility, he decided to step-on for this effort and call people to make a disciplined organization and he therefore laid the foundation of Tanzeem-e-Islami.
        </p>
      </div>
    `
  },
  "organization/mission-statement": {
    title: "Mission Statement",
    excerpt: "The defined purpose and mission of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">Our mission is to establish the Deen of Allah in its entirety, at all levels of human existence - individual as well as collective, societal as well as state.</p>
        <p class="text-lg leading-relaxed text-[#222222]">We believe that the struggle to establish the Islamic system of social justice is the ultimate obligation of every Muslim in the present era, and this struggle must be carried out in an organized manner through a disciplined jamaat (party).</p>
        <div class="bg-primary/5 border border-primary/20 p-6 rounded-xl mt-6">
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
  "organization/our-ideology": {
    title: "Our Ideology",
    excerpt: "An overview of the core ideology that forms the foundation of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">The core ideology of Tanzeem-e-Islami stems from the pure and complete interpretation of Islam. We believe that Islam is not a mere set of rituals or a personal belief system, but a comprehensive Deen (system of life) designed by Allah to govern all aspects of human society.</p>
        <p class="text-lg leading-relaxed text-[#222222]">We strive to revive the prophetic model of societal change, which begins with individual purification and moves toward collective revolution under a disciplined leadership.</p>
        
      </div>
    `
  },
  "organization/our-ideology/basic-belief": {
    title: "Basic Belief",
    excerpt: "The basic theological and ideological beliefs of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">At the center of our belief is the absolute sovereignty of Allah (Tawheed) over all aspects of creation, including governance and legislation. No human authority, assembly, or king has the right to legislate in defiance of the Quran and Sunnah.</p>
        <p class="text-lg leading-relaxed text-[#222222]">We believe that accepting any authority other than Allah as supreme is a form of Shirk (associating partners with Allah), and that the primary duty of the Prophets was to free mankind from the subjugation of other humans and bring them under the sole obedience of their Creator.</p>
      </div>
    `
  },
  "organization/our-ideology/our-obligations": {
    title: "Our Obligations",
    excerpt: "The critical obligations of Muslims regarding the establishment of Deen.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">According to the Quran, the obligations of a Muslim are not limited to personal worship. Every Muslim is obligated to actively participate in the struggle to make the word of Allah supreme (Iqamat-e-Deen).</p>
        <p class="text-lg leading-relaxed text-[#222222]">This obligation requires two distinct dimensions:</p>
        <ul class="list-decimal pl-6 space-y-3 text-lg text-foreground-muted">
          <li><strong>Individual Level:</strong> Obeying Allah's commands in personal life, including prayer, fasting, character, and business transactions.</li>
          <li><strong>Collective Level:</strong> Cooperating with other believers in an organized body (Jamaat) to challenge falsehood and establish the divine order in the public sphere.</li>
        </ul>
      </div>
    `
  },
  "organization/our-ideology/methodology": {
    title: "Methodology",
    excerpt: "The prophetic methodology for Islamic revolution and reform.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">Our methodology is derived directly from the Seerah (biography) of Prophet Muhammad (PBUH) during the Makkan and early Madinan periods. This methodology is peaceful, educational, and revolutionary, avoiding any underground or militant struggle.</p>
        <p class="text-lg leading-relaxed text-[#222222]">The core phases of our struggle are:</p>
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
  "organization/our-ideology/foundation": {
    title: "Foundation",
    excerpt: "The historical foundation and establishment of Tanzeem-e-Islami.",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">The foundation of Tanzeem-e-Islami was laid in 1975 by Dr. Israr Ahmed along with a small group of dedicated companions who felt the urgent need for a structured effort to re-establish the Islamic system in Pakistan and beyond.</p>
        <p class="text-lg leading-relaxed text-[#222222]">The foundation stone was laid with a commitment to listen and obey (Bai'ah) the Ameer in all matters conforming to the Shari'ah, restoring the early Islamic model of organization.</p>
      </div>
    `
  },
  "organization/the-founder": {
    title: "Dr. Israr Ahmed",
    excerpt: "APRIL 26, 1932 – APRIL 14, 2010",
    template: "leader",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">Dr. Israr Ahmad, the second son of a government servant, was born on April 26, 1932 in Hisar (a district of East Punjab, now a part of Haryana) in India. He graduated from King Edward Medical College (Lahore) in 1954 and later received his masters in Islamic Studies from the University of Karachi in 1965. He came under the influence of Allama Iqbal and Maulana Abul A\`la Maududi as a young student, worked briefly for Muslim Student’s Federation in the Independence Movement and, following the creation of Pakistan in 1947, for the Islami Jami\`yat-e-Talaba and then for the Jama\`at-e-Islami.</p>
        <p class="text-lg leading-relaxed text-[#222222]">Dr. Israr Ahmad resigned from the Jama\`at in April 1957 because of its involvement in the electoral politics, which he believed was irreconcilable with the revolutionary methodology adopted by the Jama’at in the pre-1947 period. While still a student and an activist of the Islami Jami\`yat-e-Talaba, Dr. Israr Ahmad gained considerable fame and eminence as a Mudarris (or teacher) of the Holy Qur’an.</p>
        <p class="text-lg leading-relaxed text-[#222222]">Even after resigning from the Jama\`at, he continued to give Qur’anic lectures in different cities of Pakistan, and especially after 1965 he has, according to his own disclosure, invested the better part of his physical and intellectual abilities in the learning and teaching of the Qur’an’ic wisdom.</p>
        <p class="text-lg leading-relaxed text-[#222222]">Dr. Israr Ahmad wrote an extremely significant tract in 1967 in which he explained his basic thought — that an Islamic Renaissance is possible only by revitalizing the Iman (true faith and conviction) among the Muslims, particularly their intelligentsia. The revitalization of Iman, in turn, is possible only by the propagation of the Qur’an’ic teachings and the study of the Qur’an in modern terms.</p>
      </div>
    `
  },
  "organization/the-ameer": {
    title: "Shujauddin Shaikh",
    excerpt: "AMEER (2020 – PRESENT)",
    template: "leader",
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">Mohtaram Shujauddin Shaikh is the current Ameer (leader) of Tanzeem-e-Islami, who assumed the responsibility in 2020 following the resignation of Hafiz Akif Saeed on health grounds. Born on September 29, 1974, he has been an active member of the organization for over two decades, contributing significantly to its educational, organizational, and propagation activities across Pakistan and internationally.</p>
        <p class="text-lg leading-relaxed text-[#222222]">Before assuming the leadership, he served in various key capacities within Tanzeem-e-Islami, including as the Nazim of different regions and as a prominent speaker of Quranic lectures. He has gained widespread recognition for his articulation of Islamic teachings in the context of contemporary socio-political and economic challenges.</p>
        <p class="text-lg leading-relaxed text-[#222222]">Under his leadership, Tanzeem-e-Islami has significantly expanded its digital outreach, utilizing modern media platforms to broadcast Quranic education, lectures, and organizational messages to a global audience. He remains committed to the core vision of the founder, Dr. Israr Ahmed, focusing on individual reform (Tazkiyah) and collective struggle for the establishment of the Islamic system (Khilafah).</p>
        <p class="text-lg leading-relaxed text-[#222222]">He regularly delivers the Friday Sermon (Khitab-e-Jum'ah) at the central Quran Academy in Lahore and travels extensively to engage with different chapters of the organization and the broader Muslim community, emphasizing unity and disciplined effort.</p>
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
    try {
      const user = await db.query.users.findFirst();
      if (user) {
        await db.insert(pages).values({
          id: crypto.randomUUID(),
          title: SEED_DATA[slug].title,
          slug: slug,
          content: SEED_DATA[slug].content,
          excerpt: SEED_DATA[slug].excerpt,
          featuredImage: null,
          template: SEED_DATA[slug].template || "default",
          parentId: null,
          order: 0,
          isPublished: true,
          showInMenu: true,
          metaTitle: null,
          metaDescription: null,
          
          canonicalUrl: null,
          ogImage: null,
          schemaType: "WebPage",
          noIndex: false,
          authorId: user.id,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        page = await findPageBySlug(slug);
      }
    } catch (err) {
      console.warn(`Concurrent seeding insert for slug '${slug}' caught:`, err);
    }
  }

  if (!page || !page.isPublished) return { title: "Page Not Found" };

  return buildMetadata({
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt || undefined,
    path: `/${slug}`,
    ogImage: (page as any).ogImage || page.featuredImage || null,
    noIndex: (page as any).noIndex ?? false,
  });
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function DynamicPage({ params }: PageProps) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");

  let page = await findPageBySlug(slug);

  if (!page && SEED_DATA[slug]) {
    try {
      const user = await db.query.users.findFirst();
      if (user) {
        await db.insert(pages).values({
          id: crypto.randomUUID(),
          title: SEED_DATA[slug].title,
          slug: slug,
          content: SEED_DATA[slug].content,
          excerpt: SEED_DATA[slug].excerpt,
          featuredImage: null,
          template: SEED_DATA[slug].template || "default",
          parentId: null,
          order: 0,
          isPublished: true,
          showInMenu: true,
          metaTitle: null,
          metaDescription: null,
          
          canonicalUrl: null,
          ogImage: null,
          schemaType: "WebPage",
          noIndex: false,
          authorId: user.id,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        page = await findPageBySlug(slug);
      }
    } catch (err) {
      console.warn(`Concurrent seeding insert for slug '${slug}' caught:`, err);
    }
  }

  if (!page || !page.isPublished) {
    // ── Legacy URL Redirect Fallback ───────────────────────────────────────────────
    // If the generic page is not found, check if the slug matches a legacy root-level 
    // taxonomy (speaker, audio/video/book category) and 301 redirect to the new route.

    // Check Speakers
    const speakerMatch = await db.query.speakers.findFirst({ where: eq(speakers.slug, slug) });
    if (speakerMatch) permanentRedirect(`/audios-by-speaker/${speakerMatch.slug}`);

    // Check Audio Categories
    const audioCatMatch = await db.query.audioCategories.findFirst({ where: eq(audioCategories.slug, slug) });
    if (audioCatMatch) permanentRedirect(`/audios-by-category/${audioCatMatch.slug}`);

    // Check Video Categories
    const videoCatMatch = await db.query.videoCategories.findFirst({ where: eq(videoCategories.slug, slug) });
    if (videoCatMatch) permanentRedirect(`/videos-by-category/${videoCatMatch.slug}`);

    // Check Book Categories
    const bookCatMatch = await db.query.bookCategories.findFirst({ where: eq(bookCategories.slug, slug) });
    if (bookCatMatch) permanentRedirect(`/books-by-category/${bookCatMatch.slug}`);

    // If no legacy mapping is found, return 404
    notFound();
  }

  let sections: any[] = [];
  try {
    sections = await db.query.pageSections.findMany({
      where: and(
        eq(pageSections.pageId, page.id),
        eq(pageSections.isActive, true)
      ),
      orderBy: (s, { asc }) => [asc(s.order)],
    });
  } catch (err) {
    console.error(`Failed to fetch pageSections for ${page.id}:`, err);
  }

  // Build JSON-LD for this page
  const webpage = webPageJsonLd({
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt || undefined,
    path: `/${slug}`,
    datePublished: page.publishedAt,
    dateModified: page.updatedAt,
  });

  const crumbs = slugArray.map((seg, i) => ({
    name: seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    path: "/" + slugArray.slice(0, i + 1).join("/"),
  }));
  const bc = breadcrumbJsonLd(crumbs);

  const ldId = slug.replace(/\//g, "-");

  const normalizedSlug = slug.replace(/^organization\//, "");

  // ── Custom Section State ────────────────────────────────────────────────────
  let stats: any = undefined;
  let accordionItems: any = undefined;
  let ideologyCards: any = undefined;
  let ctaHeading: string | undefined = undefined;
  let ctaSubheading: string | undefined = undefined;
  let ctaButtonLabel: string | undefined = undefined;
  let ctaButtonUrl: string | undefined = undefined;
  let founderMedia: any = null;
  let speakerSlugLinks = { audios: "", videos: "" };

  if (normalizedSlug === "the-founder" || normalizedSlug === "the-ameer") {
    try {
      const dbSpeakerSlug = normalizedSlug === "the-founder" ? "dr-israr-ahmad" : "shujauddin-sheikh";
      speakerSlugLinks.audios = normalizedSlug === "the-founder" ? "/audios-by-speaker/dr-israr-ahmad" : "/audios-by-speaker/shujauddin-sheikh";
      speakerSlugLinks.videos = normalizedSlug === "the-founder" ? "/videos-by-speakers/dr-israr-ahmad-videos" : "/videos-by-speakers/shujauddin-sheikh";

      const speaker = await db.query.speakers.findFirst({
        where: eq(speakers.slug, dbSpeakerSlug)
      });

      if (speaker) {
        const latestAudios = await db.query.audio.findMany({
          where: eq(audio.speakerId, speaker.id),
          orderBy: [sql`RAND()`],
          limit: 4
        });

        const latestVideos = await db.query.videos.findMany({
          where: eq(videos.speakerId, speaker.id),
          orderBy: [sql`RAND()`],
          limit: 4
        });

        const latestBooks = normalizedSlug === "the-ameer" ? [] : await db.query.books.findMany({
          where: eq(books.isPublished, true),
          orderBy: [sql`RAND()`],
          limit: 4
        });

        founderMedia = {
          audios: latestAudios,
          videos: latestVideos,
          books: latestBooks
        };
      }
    } catch (e) {
      console.error("Failed fetching founder media", e);
    }
  }

  let mediaGridData: any[] = [];
  if (page.id === '56f118be-bcad-42a0-a60a-37300adc8a39' || page.slug === 'audios-by-category') {
    let rawCategories: any[] = [];
    let allAudio: any[] = [];
    try {
      rawCategories = await db.select().from(audioCategories).orderBy(asc(audioCategories.order));
      allAudio = await db.select().from(audio);
    } catch (err) {
      console.error("Failed to fetch audio categories or audio:", err);
    }

    mediaGridData = rawCategories
      .filter(cat => !cat.parentId)
      .map(mainCat => {
        const subCats = rawCategories
          .filter(subCat => subCat.parentId === mainCat.id)
          .map(subCat => ({
            id: subCat.id,
            title: subCat.name,
            code: subCat.code,
            mediaItems: allAudio.filter(a => a.categoryId === subCat.id).map(a => ({
              id: a.slug,
              title: a.title,
              mediaUrl: a.audioUrl,
              description: a.description,
              code: a.code
            }))
          }));

        const directMedia = allAudio.filter(a => a.categoryId === mainCat.id).map(a => ({
          id: a.slug,
          title: a.title,
          mediaUrl: a.audioUrl,
          description: a.description,
          code: a.code
        }));

        if (directMedia.length > 0) {
          subCats.unshift({
            id: mainCat.id + "_direct",
            title: mainCat.name,
            code: mainCat.code,
            mediaItems: directMedia
          });
        }

        return {
          id: mainCat.id,
          title: mainCat.name,
          code: mainCat.code,
          subCategories: subCats
        };
      });
  } else if (page.id === 'e34f44a9-bd26-4433-a962-250991321181' || page.slug === 'videos-by-category') {
    let rawCategories: any[] = [];
    let allVideos: any[] = [];
    try {
      rawCategories = await db.select().from(videoCategories).orderBy(asc(videoCategories.order));
      allVideos = await db.select().from(videos);
    } catch (err) {
      console.error("Failed to fetch video categories or videos:", err);
    }

    mediaGridData = rawCategories
      .filter(cat => !cat.parentId)
      .map(mainCat => {
        const subCats = rawCategories
          .filter(subCat => subCat.parentId === mainCat.id)
          .map(subCat => ({
            id: subCat.id,
            title: subCat.name,
            image: subCat.imageUrl,
            code: subCat.code,
            mediaItems: allVideos.filter(v => v.categoryId === subCat.id).map(v => ({
              id: v.slug,
              title: v.title,
              mediaUrl: v.videoUrl || v.embedUrl,
              embedUrl: v.embedUrl,
              description: v.description,
              code: v.episodeNumber
            }))
          }));

        const directMedia = allVideos.filter(v => v.categoryId === mainCat.id).map(v => ({
          id: v.slug,
          title: v.title,
          mediaUrl: v.videoUrl || v.embedUrl,
          embedUrl: v.embedUrl,
          description: v.description,
          code: v.episodeNumber
        }));

        if (directMedia.length > 0) {
          subCats.unshift({
            id: mainCat.id + "_direct",
            title: mainCat.name,
            image: mainCat.imageUrl,
            code: mainCat.code,
            mediaItems: directMedia
          });
        }

        return {
          id: mainCat.id,
          title: mainCat.name,
          code: mainCat.code,
          subCategories: subCats
        };
      });
  }

  if (normalizedSlug === "background") {
    ctaHeading = "Learn About Our Mission";
    ctaSubheading = "Discover how Tanzeem-e-Islami works toward the revival of Islam.";
    ctaButtonLabel = "Mission Statement";
    ctaButtonUrl = "/mission-statement";
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
    ctaButtonUrl = "/our-ideology";
  } else if (normalizedSlug === "our-ideology") {
    ideologyCards = [
      { title: "Basic Belief",     href: "/organization/our-ideology/basic-belief",     description: "Fundamental Islamic beliefs and principles" },
      { title: "Our Obligations",  href: "/organization/our-ideology/our-obligations",  description: "Our duties and responsibilities as Muslims" },
      { title: "Methodology",      href: "/organization/our-ideology/methodology",       description: "Our approach and method of work" },
      { title: "Foundation",       href: "/organization/our-ideology/foundation",        description: "The foundational principles of our movement" },
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
    ctaButtonUrl = "/the-founder";
  } else if (normalizedSlug === "the-founder") {
    ctaHeading = "Meet Our Ameer";
    ctaSubheading = "Discover the current Ameer of Tanzeem-e-Islami and read his profile.";
    ctaButtonLabel = "The Ameer";
    ctaButtonUrl = "/the-ameer";
  } else if (normalizedSlug === "the-ameer") {
    ctaHeading = "Explore Our Ideology";
    ctaSubheading = "Learn about the beliefs and principles that guide our work.";
    ctaButtonLabel = "Our Ideology";
    ctaButtonUrl = "/our-ideology";
  }

  if (page.template === "redirect") {
    return <RedirectPage title={page.title} url={page.content.trim() || "/"} />;
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
      {sections.length > 0 && page.template !== "leader" ? (() => {
        const parsedSections = sections.map(s => {
          let config = s.config;
          if (typeof config === "string") {
            try { config = JSON.parse(config); } catch (e) { config = {}; }
          }
          return { ...s, config };
        });
        return slug.startsWith("organization/") ? (
          <main className="bg-background">
            <DynamicPageContent sections={parsedSections as any} />
          </main>
        ) : (
          <ModernizedProsePage
            title={page.title}
            excerpt={page.excerpt}
            content=""
            slug={slug}
            breadcrumbs={crumbs}
            featuredImage={page.featuredImage}
            template={page.template || undefined}
          >
            <DynamicPageContent sections={parsedSections as any} />
          </ModernizedProsePage>
        );
      })() : (page.slug === 'audios-by-category' || page.slug === 'videos-by-category') ? (
        <div className="py-6">
          <NestedCategoryGrid
            heading={page.title}
            style={page.slug === 'audios-by-category' ? 'capsule' : 'image_card'}
            categories={mediaGridData}
          />
        </div>
      ) : (
        <ModernizedProsePage
          title={page.title}
          excerpt={page.excerpt}
          content={page.content}
          slug={slug}
          breadcrumbs={crumbs}
          featuredImage={page.featuredImage}
          template={page.template || undefined}
          stats={stats}
          accordionItems={accordionItems}
          ideologyCards={ideologyCards}
          ctaHeading={ctaHeading}
          ctaSubheading={ctaSubheading}
          ctaButtonLabel={ctaButtonLabel}
          ctaButtonUrl={ctaButtonUrl}
        >
          {founderMedia && (
            <div className="space-y-4">
              {founderMedia.audios.length > 0 && (
                <div className="py-2 container mx-auto">
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Latest Audios</h2>
                    <Link href={speakerSlugLinks.audios} className="text-primary font-bold inline-flex items-center gap-2 hover:underline">
                      View All Resources <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <AudioListClient audios={founderMedia.audios} />
                </div>
              )}
              {founderMedia.videos.length > 0 && (
                <div className="py-10 container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Latest Videos</h2>
                    <Link href={speakerSlugLinks.videos} className="text-primary font-bold inline-flex items-center gap-2 hover:underline">
                      View All Resources <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <VideoListClient vids={founderMedia.videos} />
                </div>
              )}
              {founderMedia.books.length > 0 && (
                <PublicationGrid
                  heading="Latest Books"
                  viewAllUrl="/books-by-category"
                  publications={founderMedia.books.map((b: any) => ({
                    title: b.title,
                    cover: b.coverImage || '/images/default-book.jpg',
                    link: `/books/${b.slug}`
                  }))}
                />
              )}
            </div>
          )}
        </ModernizedProsePage>
      )}
    </>
  );
}
