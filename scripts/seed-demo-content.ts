/**
 * Seeds demo content: speakers, categories, audio, videos, books,
 * magazines, press releases, Quranic circle locations, campaigns.
 * Run: npx tsx scripts/seed-demo-content.ts
 */
import { db } from "../src/db";
import {
  users,
  speakers,
  audioCategories,
  videoCategories,
  bookCategories,
  audio,
  videos,
  books,
  magazines,
  pressReleases,
  locations,
  homeCampaigns,
} from "../src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const PLACEHOLDER_AUDIO =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const PLACEHOLDER_IMG = (t: string) =>
  `https://placehold.co/800x450/0D5844/C8A96E?text=${encodeURIComponent(t)}`;

async function getAuthorId(): Promise<string> {
  const u = await db.query.users.findFirst();
  if (u) return u.id;
  const id = uuidv4();
  await db.insert(users).values({
    id,
    email: "admin@tanzeem.org",
    name: "Admin",
    password: "seed-only",
    role: "admin",
    isActive: true,
  });
  return id;
}

async function seed() {
  const authorId = await getAuthorId();
  console.log("Using authorId:", authorId);

  const speakerData = [
    { name: "Dr. Israr Ahmed", slug: "dr-israr-ahmed" },
    { name: "Shujauddin Sheikh", slug: "shujauddin-sheikh" },
    { name: "Dr. Tanzeem", slug: "dr-tanzeem" },
    { name: "Hafiz Sahab", slug: "hafiz-sahab" },
  ];
  const speakerIds: Record<string, string> = {};
  for (const s of speakerData) {
    const existing = await db.query.speakers.findFirst({
      where: eq(speakers.slug, s.slug),
    });
    if (existing) {
      speakerIds[s.slug] = existing.id;
    } else {
      const id = uuidv4();
      await db.insert(speakers).values({
        id,
        name: s.name,
        slug: s.slug,
        avatar: PLACEHOLDER_IMG(s.name),
      });
      speakerIds[s.slug] = id;
    }
  }

  const audioCatData = [
    { name: "Dars-e-Quran", slug: "dars-e-quran" },
    { name: "Khutbat-e-Jummah", slug: "khutbat-e-jummah" },
    { name: "Q&A Sessions", slug: "qa-sessions" },
  ];
  const audioCatIds: Record<string, string> = {};
  for (const c of audioCatData) {
    const existing = await db.query.audioCategories.findFirst({
      where: eq(audioCategories.slug, c.slug),
    });
    if (existing) audioCatIds[c.slug] = existing.id;
    else {
      const id = uuidv4();
      await db.insert(audioCategories).values({ id, ...c });
      audioCatIds[c.slug] = id;
    }
  }

  const audioTitles = [
    "Islam ka Siyasi Nizam - Part 1",
    "Quran ki Dawat - Introduction",
    "Khutbat-e-Jummah - Ramadan Special",
    "Bayan ul Quran - Surah Al-Baqarah 1",
    "Muntakhab Nisab - Session 12",
    "Establishment of Khilafah - Lecture",
    "Tafseer Series - Surah Yusuf",
    "Youth and Islamic Revival",
    "Palestine and Muslim Ummah",
    "Weekly Dars - Tauheed",
  ];
  for (let i = 0; i < audioTitles.length; i++) {
    const slug = `demo-audio-${i + 1}`;
    const exists = await db.query.audio.findFirst({ where: eq(audio.slug, slug) });
    if (!exists) {
      await db.insert(audio).values({
        id: uuidv4(),
        title: audioTitles[i],
        slug,
        audioUrl: PLACEHOLDER_AUDIO,
        thumbnailUrl: PLACEHOLDER_IMG(audioTitles[i]),
        speakerId: speakerIds["dr-israr-ahmed"],
        categoryId: audioCatIds[i % 2 === 0 ? "dars-e-quran" : "khutbat-e-jummah"],
        isPublished: true,
        authorId,
        publishedAt: new Date(),
      });
    }
  }

  const videoTitles = [
    "Zamana Gawah Hai - Episode 100",
    "Ameer Say Mulaqat - Session 45",
    "Quranic Guidance for Modern Age",
    "Free Palestine - Statement",
  ];
  for (let i = 0; i < videoTitles.length; i++) {
    const slug = `demo-video-${i + 1}`;
    const exists = await db.query.videos.findFirst({ where: eq(videos.slug, slug) });
    if (!exists) {
      await db.insert(videos).values({
        id: uuidv4(),
        title: videoTitles[i],
        slug,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: PLACEHOLDER_IMG(videoTitles[i]),
        speakerId: speakerIds["shujauddin-sheikh"],
        isPublished: true,
        isFeatured: i < 2,
        authorId,
        publishedAt: new Date(),
      });
    }
  }

  const bookTitles = [
    { title: "Islam ka Siyasi Nizam", author: "Dr. Israr Ahmed" },
    { title: "Quran ki Dawat", author: "Dr. Israr Ahmed" },
    { title: "Khilafat-o-Malookiat", author: "Dr. Israr Ahmed" },
    { title: "Maqamat", author: "Dr. Israr Ahmed" },
    { title: "Shahadat-e-Haq", author: "Dr. Israr Ahmed" },
    { title: "Tanzeem ki Tareekh", author: "Tanzeem-e-Islami" },
  ];
  for (let i = 0; i < bookTitles.length; i++) {
    const slug = `demo-book-${i + 1}`;
    const exists = await db.query.books.findFirst({ where: eq(books.slug, slug) });
    if (!exists) {
      await db.insert(books).values({
        id: uuidv4(),
        title: bookTitles[i].title,
        slug,
        authorName: bookTitles[i].author,
        coverImage: PLACEHOLDER_IMG(bookTitles[i].title),
        fileUrl: "#",
        isPublished: true,
        isFeatured: i < 4,
        authorId,
        publishedAt: new Date(),
      });
    }
  }

  const magSeries = [
    { prefix: "meesaq", name: "Meesaq" },
    { prefix: "hikmat-e-quran", name: "Hikmat-e-Quran" },
    { prefix: "nida-e-khilafat", name: "Nida-e-Khilafat" },
  ];
  for (const series of magSeries) {
    for (let issue = 1; issue <= 3; issue++) {
      const slug = `${series.prefix}-issue-${issue}`;
      const exists = await db.query.magazines.findFirst({
        where: eq(magazines.slug, slug),
      });
      if (!exists) {
        await db.insert(magazines).values({
          id: uuidv4(),
          title: `${series.name} - Issue ${issue}`,
          slug,
          issueNumber: String(issue),
          coverImage: PLACEHOLDER_IMG(`${series.name} ${issue}`),
          fileUrl: "#",
          isPublished: true,
          authorId,
          publishDate: new Date(),
        });
      }
    }
  }

  const pressTitles = [
    "Statement on Gaza and Muslim Unity",
    "Press Release: Annual Ijtima 2025",
    "Commentary on Economic Justice in Islam",
    "Call for Youth Participation in Quranic Circles",
    "Official Position on Political Activism",
  ];
  for (let i = 0; i < pressTitles.length; i++) {
    const slug = `press-${i + 1}`;
    const exists = await db.query.pressReleases.findFirst({
      where: eq(pressReleases.slug, slug),
    });
    if (!exists) {
      await db.insert(pressReleases).values({
        id: uuidv4(),
        title: pressTitles[i],
        slug,
        content: `<p>${pressTitles[i]} — full text managed via Site Manager.</p>`,
        excerpt: pressTitles[i],
        isPublished: true,
        publishedAt: new Date(),
      });
    }
  }

  const cities = [
    { name: "Karachi Circle", city: "Karachi", address: "Gulshan-e-Iqbal, Karachi" },
    { name: "Lahore Circle", city: "Lahore", address: "Johar Town, Lahore" },
    { name: "Islamabad Circle", city: "Islamabad", address: "F-10 Markaz, Islamabad" },
    { name: "Peshawar Circle", city: "Peshawar", address: "University Town, Peshawar" },
    { name: "Faisalabad Circle", city: "Faisalabad", address: "D Ground, Faisalabad" },
    { name: "Hyderabad Circle", city: "Hyderabad", address: "Latifabad, Hyderabad" },
  ];
  for (const c of cities) {
    const slug = c.city.toLowerCase();
    const exists = await db.query.locations.findFirst({
      where: eq(locations.slug, slug),
    });
    if (!exists) {
      await db.insert(locations).values({
        id: uuidv4(),
        name: c.name,
        slug,
        city: c.city,
        address: c.address,
        phone: "+92 42 35869501",
        isActive: true,
      });
    }
  }

  const campaigns = [
    { title: "Free Palestine", order: 1 },
    { title: "Quranic Circles Expansion", order: 2 },
    { title: "Youth Islamic Education", order: 3 },
  ];
  for (const camp of campaigns) {
    const [existing] = await db
      .select()
      .from(homeCampaigns)
      .where(eq(homeCampaigns.title, camp.title))
      .limit(1);
    if (!existing) {
      await db.insert(homeCampaigns).values({
        id: uuidv4(),
        title: camp.title,
        imageUrl: PLACEHOLDER_IMG(camp.title),
        linkUrl: "/public-programs",
        order: camp.order,
        isActive: true,
      });
    }
  }

  console.log("Demo content seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
