import "dotenv/config";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

interface SectionInput {
  type: string;
  config: any;
  order: number;
}

async function getPageId(slug: string): Promise<string | null> {
  const page = await db.query.pages.findFirst({ where: eq(pages.slug, slug) });
  return page?.id || null;
}

async function upsertSections(pageSlug: string, sections: SectionInput[]) {
  const pageId = await getPageId(pageSlug);
  if (!pageId) {
    console.log(`  Skipping "${pageSlug}" — page not found in DB`);
    return;
  }

  // Remove existing sections for this page
  await db.delete(pageSections).where(eq(pageSections.pageId, pageId));

  // Insert new ones
  for (const s of sections) {
    await db.insert(pageSections).values({
      id: uuidv4(),
      pageId,
      type: s.type,
      order: s.order,
      config: s.config,
      isActive: true,
    });
  }
  console.log(`  Seeded ${sections.length} sections for "${pageSlug}"`);
}

async function main() {
  console.log("Seeding page sections for CMS-driven pages...\n");

  // ── Organization / Background ──
  await upsertSections("organization/background", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Background of Tanzeem-e-Islami",
        subheading: "History & Founding",
        body: "<p>Tanzeem-e-Islami is an Islamic revivalist movement founded in 1975 by Dr. Israr Ahmed (1932–2010). The organization emerged from a deep concern about the Muslim Ummah's political, social, and spiritual decline and a firm belief that the only solution lies in a comprehensive return to the Quran and the Sunnah.</p><p>Founded in Lahore, Pakistan, the Tanzeem began as a small group of committed individuals who shared Dr. Israr Ahmed's vision of a dedicated cadre of workers (kaar-kun) devoted to the revival of Islam.</p>",
        image: "https://tanzeem.org/media/tanzeem-headquarters.jpg",
        alignment: "left",
      },
    },
    {
      type: "stats",
      order: 1,
      config: {
        stats: [
          { number: "1975", label: "Founded" },
          { number: "50+", label: "Years" },
          { number: "100+", label: "Dars-e-Quran Circles" },
          { number: "Global", label: "Reach" },
        ],
      },
    },
    {
      type: "cta_banner",
      order: 2,
      config: {
        heading: "Learn About Our Mission",
        subheading: "Discover how Tanzeem-e-Islami works toward the revival of Islam.",
        buttonLabel: "Mission Statement",
        buttonUrl: "/organization/mission-statement",
      },
    },
  ]);

  // ── Organization / Mission Statement ──
  await upsertSections("organization/mission-statement", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Our Mission",
        subheading: "Purpose & Vision",
        body: "<p>Tanzeem-e-Islami is dedicated to the revival of the Islamic way of life (Deen-e-Islam) in its totality, based on the Quran and the Sunnah of Prophet Muhammad (peace be upon him). The mission is to work for the establishment of the Islamic System (Nizam-e-Mustafa) in all aspects of human life.</p>",
        alignment: "left",
      },
    },
    {
      type: "stats",
      order: 1,
      config: {
        stats: [
          { number: "1975", label: "Founded" },
          { number: "50+", label: "Years of Service" },
          { number: "100+", label: "Dars-e-Quran Circles" },
          { number: "Global", label: "Reach" },
        ],
      },
    },
    {
      type: "accordion",
      order: 2,
      config: {
        heading: "Key Objectives",
        items: [
          { question: "Revival of Faith (Iman)", answer: "To revive the true spirit of Iman in the hearts of Muslims, based on the understanding of the Quran and the Sunnah." },
          { question: "Intellectual Awakening", answer: "To promote critical thinking and intellectual engagement with Islamic teachings, addressing contemporary challenges from an Islamic perspective." },
          { question: "Moral Training (Tazkiyah)", answer: "To provide spiritual and moral training to individuals so they become exemplary Muslims and agents of positive change in society." },
          { question: "Social Reform", answer: "To work for the reform of society based on Islamic values of justice, compassion, and brotherhood." },
          { question: "Unity of the Ummah", answer: "To promote unity and cooperation among different Islamic movements for the collective revival of the Ummah." },
        ],
      },
    },
    {
      type: "cta_banner",
      order: 3,
      config: {
        heading: "Explore Our Ideology",
        subheading: "Learn about the beliefs and principles that guide our work.",
        buttonLabel: "Our Ideology",
        buttonUrl: "/organization/our-ideology",
      },
    },
  ]);

  // ── Organization / The Founder ──
  await upsertSections("organization/the-founder", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Dr. Israr Ahmed (1932–2010)",
        subheading: "Founder of Tanzeem-e-Islami",
        body: "<p>Dr. Israr Ahmed was a visionary Islamic scholar, theologian, philosopher, and the founder of Tanzeem-e-Islami. His intellectual depth, spiritual insight, and unwavering commitment to the revival of Islam left an indelible mark on the Islamic movement in Pakistan and beyond.</p>",
        image: "https://tanzeem.org/media/dr-israr-ahmed.jpg",
        alignment: "right",
      },
    },
    {
      type: "team",
      order: 1,
      config: {
        heading: "Founder & First Ameer",
        members: [
          { name: "Dr. Israr Ahmed", designation: "Founder & First Ameer (1975–2010)", avatar: "https://tanzeem.org/media/dr-israr-ahmed.jpg" },
        ],
      },
    },
    {
      type: "cta_banner",
      order: 2,
      config: {
        heading: "Current Leadership",
        subheading: "Meet Shujauddin Sheikh, the current Ameer of Tanzeem-e-Islami.",
        buttonLabel: "The Ameer",
        buttonUrl: "/organization/the-ameer",
      },
    },
  ]);

  // ── Organization / The Ameer ──
  await upsertSections("organization/the-ameer", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Shujauddin Sheikh",
        subheading: "Current Ameer of Tanzeem-e-Islami",
        body: "<p>Shujauddin Sheikh assumed the leadership of Tanzeem-e-Islami in 2020, following the organization's established tradition of Shura-based leadership selection. He brings a blend of Islamic scholarship and modern management expertise to guide the organization's vision.</p>",
        image: "https://tanzeem.org/media/shujauddin-sheikh.jpg",
        alignment: "right",
      },
    },
    {
      type: "cta_banner",
      order: 1,
      config: {
        heading: "Learn About Our Mission",
        subheading: "Discover the mission that guides Tanzeem-e-Islami.",
        buttonLabel: "Mission Statement",
        buttonUrl: "/organization/mission-statement",
      },
    },
  ]);

  // ── Resources / Audios ──
  await upsertSections("resources/audios", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Audio Library",
        subheading: "Islamic Lectures & Bayans",
        body: "<p>Browse our extensive collection of audio lectures, Quran commentaries, and Islamic talks by Dr. Israr Ahmed and other scholars.</p>",
        alignment: "left",
      },
    },
    {
      type: "cta_banner",
      order: 1,
      config: {
        heading: "Explore Video Library",
        subheading: "Watch Islamic lectures and programs.",
        buttonLabel: "Videos",
        buttonUrl: "/resources/videos",
      },
    },
  ]);

  // ── Resources / Videos ──
  await upsertSections("resources/videos", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Video Library",
        subheading: "Islamic Lectures & Programs",
        body: "<p>Explore our video collection featuring Bayan-ul-Quran, Zamana Gawah Hai, Ameer Say Mulaqat, Tazkeer, and many more programs.</p>",
        alignment: "left",
      },
    },
  ]);

  // ── Resources / Books ──
  await upsertSections("resources/books", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Books & Publications",
        subheading: "Islamic Literature",
        body: "<p>Access a wide range of Islamic books covering Tafseer, Hadith, Fiqh, Islamic history, and contemporary issues by various authors.</p>",
        alignment: "left",
      },
    },
  ]);

  // ── Resources / Magazines ──
  await upsertSections("resources/magazines", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Magazines",
        subheading: "Periodicals of Tanzeem-e-Islami",
        body: "<p>Browse our collection of magazines including Meesaq (monthly), Hikmat-e-Quran (quarterly), Nida-e-Khilafat, and Perspective (English).</p>",
        alignment: "left",
      },
    },
  ]);

  // ── Events ──
  await upsertSections("events", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Events & Programs",
        subheading: "Upcoming & Past Gatherings",
        body: "<p>Stay informed about Tanzeem-e-Islami's events, seminars, conferences, and public programs. We regularly organize events for spiritual enrichment, intellectual development, and community building.</p>",
        alignment: "left",
      },
    },
  ]);

  // ── Distance Learning ──
  await upsertSections("distance-learning", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Distance Learning",
        subheading: "Islamic Education Programs",
        body: "<p>Study the Quran, Hadith, and Islamic sciences from anywhere in the world through our comprehensive distance learning programs.</p>",
        alignment: "left",
      },
    },
  ]);

  // ── Markaz Tanzeem ──
  await upsertSections("markaz-tanzeem", [
    {
      type: "intro",
      order: 0,
      config: {
        heading: "Markaz Tanzeem-e-Islami",
        subheading: "Central Headquarters",
        body: "<p>Located in Lahore, Markaz Tanzeem-e-Islami is the central hub for the organization's administration, education, publications, and media activities.</p>",
        image: "https://tanzeem.org/media/tanzeem-headquarters.jpg",
        alignment: "left",
      },
    },
    {
      type: "stats",
      order: 1,
      config: {
        stats: [
          { number: "1991", label: "Established" },
          { number: "10+", label: "Acres" },
          { number: "Multi", label: "Purpose Facility" },
          { number: "HQ", label: "Role" },
        ],
      },
    },
    {
      type: "cta_banner",
      order: 2,
      config: {
        heading: "Explore Distance Learning",
        subheading: "Study Islamic sciences from anywhere in the world.",
        buttonLabel: "Distance Learning",
        buttonUrl: "/distance-learning",
      },
    },
  ]);

  console.log("\nDone seeding sections.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
