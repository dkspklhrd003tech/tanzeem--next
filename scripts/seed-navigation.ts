/**
 * seed-navigation.ts
 *
 * Seeds the `menu_items` table with the EXACT production header + footer navigation
 * matching the live tanzeem.org site structure.
 *
 * Header (menuType='main')  — mirrors the live site hierarchy exactly.
 * Footer (menuType='footer') — 4 columns modeled as top-level items (url=null)
 *
 * Run:  npx tsx scripts/seed-navigation.ts
 */
import { db } from "../src/lib/db";
import { menuItems } from "../src/db/schema";

interface NavItem {
  id: string;
  label: string;
  url: string | null;
  external?: boolean;
  children?: NavItem[];
}

// ─── Header navigation (exact structure from tanzeem.org) ────────────────────
const HEADER: NavItem[] = [
  { id: "dm-home", label: "Home", url: "/" },

  {
    id: "dm-org", label: "Organization", url: "/organization",
    children: [
      { id: "dm-org-bg", label: "Background", url: "/organization/background" },
      { id: "dm-org-ms", label: "Mission Statement", url: "/organization/mission-statement" },
      {
        id: "dm-org-ideo", label: "Our Ideology", url: "/organization/our-ideology",
        children: [
          { id: "dm-ideo-bb", label: "Basic Belief", url: "/organization/our-ideology/basic-belief" },
          { id: "dm-ideo-ob", label: "Our Obligations", url: "/organization/our-ideology/our-obligations" },
          { id: "dm-ideo-me", label: "Our Methodology", url: "/organization/our-ideology/methodology" },
          { id: "dm-ideo-fo", label: "Foundation", url: "/organization/our-ideology/foundation" },
        ],
      },
      { id: "dm-org-fo", label: "The Founder", url: "/organization/the-founder" },
      { id: "dm-org-am", label: "The Ameer", url: "/organization/the-ameer" },
    ],
  },

  {
    id: "dm-res", label: "Resources", url: null,   // top-level label only
    children: [
      {
        id: "dm-res-aud", label: "Audios", url: "/audio",
        children: [
          { id: "dm-aud-sp", label: "By Speaker", url: "/audio-books", },
          { id: "dm-aud-cat", label: "Audios By Category", url: "/audio" },
          { id: "dm-aud-ab", label: "Audio Books", url: "/audio-books" },
        ],
      },
      {
        id: "dm-res-vid", label: "Videos", url: "/videos",
        children: [
          { id: "dm-vid-cat", label: "Videos By Category", url: "/videos-by-category" },
          { id: "dm-vid-spk", label: "Videos By Speakers", url: "/videos-by-speakers" },
          { id: "dm-vid-dri1", label: "Dr. Israr Ahmad Lectures", url: "https://www.drisrar.com/", external: true },
          { id: "dm-vid-dri2", label: "Dr. Israr Ahmad (Q&A)", url: "https://www.drisrar.com/videos/category/12/sub__1254", external: true },
          { id: "dm-vid-bq", label: "Bayan ul Quran", url: "https://www.drisrar.com/videos/category/1/sub__1033", external: true },
          { id: "dm-vid-mn", label: "Muntakab Nisab", url: "https://www.drisrar.com/videos/category/4?page_id=1", external: true },
          { id: "dm-vid-vc", label: "Dr. Israr Ahmad (Video Clips)", url: "https://www.drisrar.com/videos/category/1031?page_id=1", external: true },
        ],
      },
      {
        id: "dm-res-bk", label: "Books", url: "/books",
        children: [
          { id: "dm-bk-ab", label: "Audio Books", url: "/audio-books" },
          { id: "dm-bk-cat", label: "Books by Category", url: "/books-by-category" },
        ],
      },
      {
        id: "dm-res-mag", label: "Magazines", url: "/magazines",
        children: [
          { id: "dm-mag-mq", label: "Meesaq", url: "/meesaq" },
          { id: "dm-mag-hq", label: "Hikmat-e-Quran", url: "/hikmat-e-quran" },
          { id: "dm-mag-nk", label: "Nida-e-Khilafat", url: "/nida-e-khilafat" },
        ],
      },
      { id: "dm-res-pr", label: "Press Releases", url: "/press-releases" },
      { id: "dm-res-sm", label: "Social Media", url: "/social-media" },
      { id: "dm-res-kj", label: "Khitab-e-Jum'ah (Audio)", url: "/resources/khitab-e-jumah" },
    ],
  },

  {
    id: "dm-pp", label: "Public Programs", url: "/public-programs",
    children: [
      { id: "dm-pp-qc", label: "Quranic Circles", url: "/quranic-circles" },
      { id: "dm-pp-kj", label: "Khitabat-e-Jummah Addresses", url: "/public-programs" },
      { id: "dm-pp-oc", label: "Online Courses", url: "https://lms.quranacademy.com/", external: true },
    ],
  },

  { id: "dm-faq", label: "FAQs", url: "/faq" },
  { id: "dm-join", label: "Join Tanzeem", url: "https://app.dhtr.org/contactus", external: true },
  { id: "dm-con", label: "Contact Us", url: "/contact" },
];

// ─── Footer columns (menuType = "footer") ────────────────────────────────────
const FOOTER: NavItem[] = [
  {
    id: "df-about", label: "About Us", url: null,
    children: [
      { id: "df-about-founder", label: "The Founder", url: "/organization/the-founder" },
      { id: "df-about-ameer", label: "The Ameer", url: "/organization/the-ameer" },
      { id: "df-about-join", label: "Join Tanzeem", url: "/join" },
      { id: "df-about-social", label: "Social Media", url: "/social-media" },
      { id: "df-about-contact", label: "Contact Us", url: "/contact" },
      { id: "df-about-policy", label: "Policy", url: "/policy" },
    ],
  },
  {
    id: "df-audios", label: "Audios", url: null,
    children: [
      { id: "df-aud-cat", label: "View Audios by Category", url: "/audio" },
      { id: "df-aud-spk", label: "View Audios by Speaker", url: "/audio-books" },
      { id: "df-aud-darse", label: "Dars-e-Quran", url: "/darse-quran" },
      { id: "df-aud-kj", label: "Khitab-e-Jum'ah (Audios & Videos)", url: "/resources/khitab-e-jumah" },
    ],
  },
  {
    id: "df-books", label: "Books & Articles", url: null,
    children: [
      { id: "df-bk-author", label: "View Books by Author", url: "/books-by-author" },
      { id: "df-bk-cat", label: "View Books by Category", url: "/books-by-category" },
      { id: "df-bk-mag", label: "Magazines", url: "/magazines" },
      { id: "df-bk-hq", label: "Hikmat-e-Quran", url: "/hikmat-e-quran" },
      { id: "df-bk-nk", label: "Nida-e-Khilafat", url: "/nida-e-khilafat" },
      { id: "df-bk-per", label: "Perspective", url: "/perspective" },
      { id: "df-bk-pr", label: "Press Releases", url: "/press-releases" },
    ],
  },
  {
    id: "df-videos", label: "Videos", url: null,
    children: [
      { id: "df-vid-cat", label: "View Videos by Category", url: "/videos-by-category" },
      { id: "df-vid-spk", label: "View Videos by Speaker", url: "/videos-by-speakers" },
      { id: "df-vid-dri", label: "Dr. Israr Ahmad Lectures", url: "https://www.drisrar.com/", external: true },
      { id: "df-vid-bq", label: "Bayan ul Quran", url: "https://www.drisrar.com/videos/category/1/sub__1033", external: true },
      { id: "df-vid-mn", label: "Muntakhab Nisab", url: "https://www.drisrar.com/videos/category/4?page_id=1", external: true },
      { id: "df-vid-vc", label: "Dr. Israr Ahmad (Video Clips)", url: "https://www.drisrar.com/videos/category/1031?page_id=1", external: true },
    ],
  },
];

// ─── Flatten + upsert ────────────────────────────────────────────────────────
interface FlatItem {
  id: string; label: string; url: string | null;
  parentId: string | null; order: number;
  isOpenInNew: boolean; isVisible: boolean; menuType: string;
}

function flatten(nodes: NavItem[], menuType: string, parentId: string | null = null, acc: FlatItem[] = []): FlatItem[] {
  nodes.forEach((node, idx) => {
    acc.push({
      id: node.id, label: node.label, url: node.url ?? null,
      parentId, order: idx,
      isOpenInNew: node.external === true,
      isVisible: true, menuType,
    });
    if (node.children?.length) flatten(node.children, menuType, node.id, acc);
  });
  return acc;
}

async function upsertItems(items: FlatItem[]) {
  for (const item of items) {
    await db.insert(menuItems).values({
      id: item.id, label: item.label, url: item.url,
      parentId: item.parentId, order: item.order,
      isOpenInNew: item.isOpenInNew, isVisible: item.isVisible, menuType: item.menuType,
    }).onDuplicateKeyUpdate({
      set: {
        label: item.label, url: item.url, parentId: item.parentId,
        order: item.order, isOpenInNew: item.isOpenInNew,
        isVisible: item.isVisible, menuType: item.menuType,
      },
    });
  }
}

async function main() {
  console.log("Seeding header navigation…");
  const hFlat = flatten(HEADER, "main");
  await upsertItems(hFlat);
  console.log(`  ✓ ${hFlat.length} header items upserted.`);

  console.log("Seeding footer navigation…");
  const fFlat = flatten(FOOTER, "footer");
  await upsertItems(fFlat);
  console.log(`  ✓ ${fFlat.length} footer items upserted.`);

  console.log("✅ Navigation seeded successfully.");
}

main().catch((e) => { console.error(e); process.exit(1); });
