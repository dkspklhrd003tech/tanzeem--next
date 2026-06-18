import { MetadataRoute } from "next";
import { db } from "@/db";
import { pages, audio, videos, books, magazines, pressReleases, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tanzeem.org";

const STATIC_ROUTES: { url: string; priority?: number; changeFrequency?: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { url: "/", priority: 1.0, changeFrequency: "daily" },
  { url: "/organization", priority: 0.8, changeFrequency: "monthly" },
  { url: "/organization/background", priority: 0.6, changeFrequency: "monthly" },
  { url: "/organization/mission-statement", priority: 0.6, changeFrequency: "monthly" },
  { url: "/organization/our-ideology", priority: 0.7, changeFrequency: "monthly" },
  { url: "/organization/our-ideology/basic-belief", priority: 0.6, changeFrequency: "yearly" },
  { url: "/organization/our-ideology/foundation", priority: 0.6, changeFrequency: "yearly" },
  { url: "/organization/our-ideology/methodology", priority: 0.6, changeFrequency: "yearly" },
  { url: "/organization/our-ideology/our-obligations", priority: 0.6, changeFrequency: "yearly" },
  { url: "/organization/the-founder", priority: 0.7, changeFrequency: "monthly" },
  { url: "/organization/the-ameer", priority: 0.7, changeFrequency: "monthly" },
  { url: "/resources", priority: 0.9, changeFrequency: "daily" },
  { url: "/resources/audios", priority: 0.8, changeFrequency: "daily" },
  { url: "/resources/videos", priority: 0.8, changeFrequency: "daily" },
  { url: "/resources/books", priority: 0.8, changeFrequency: "weekly" },
  { url: "/resources/magazines", priority: 0.8, changeFrequency: "monthly" },
  { url: "/audio-books", priority: 0.6, changeFrequency: "monthly" },
  { url: "/books-by-category", priority: 0.6, changeFrequency: "monthly" },
  { url: "/videos-by-category", priority: 0.6, changeFrequency: "monthly" },
  { url: "/videos-by-speakers", priority: 0.6, changeFrequency: "monthly" },
  { url: "/press-releases", priority: 0.7, changeFrequency: "daily" },
  { url: "/distance-learning", priority: 0.6, changeFrequency: "monthly" },
  { url: "/markaz-tanzeem", priority: 0.6, changeFrequency: "monthly" },
  { url: "/quranic-circles", priority: 0.6, changeFrequency: "monthly" },
  { url: "/online-courses", priority: 0.6, changeFrequency: "monthly" },
  { url: "/public-programs", priority: 0.6, changeFrequency: "monthly" },
  { url: "/public-programs/quranic-circles", priority: 0.6, changeFrequency: "monthly" },
  { url: "/public-programs/khitabat-e-jummah", priority: 0.6, changeFrequency: "weekly" },
  { url: "/meesaq", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hikmat-e-quran", priority: 0.7, changeFrequency: "monthly" },
  { url: "/nida-e-khilafat", priority: 0.7, changeFrequency: "monthly" },
  { url: "/perspective", priority: 0.7, changeFrequency: "monthly" },
  { url: "/events", priority: 0.7, changeFrequency: "daily" },
  { url: "/events/upcoming", priority: 0.7, changeFrequency: "daily" },
  { url: "/events/past", priority: 0.6, changeFrequency: "daily" },
  { url: "/events/categories", priority: 0.5, changeFrequency: "monthly" },
  { url: "/events/locations", priority: 0.5, changeFrequency: "monthly" },
  { url: "/zamana-gawah-hay", priority: 0.6, changeFrequency: "weekly" },
  { url: "/ameer-say-mulaqat", priority: 0.6, changeFrequency: "weekly" },
  { url: "/tazkeer", priority: 0.6, changeFrequency: "weekly" },
  { url: "/darse-quran", priority: 0.6, changeFrequency: "weekly" },
  { url: "/search", priority: 0.3, changeFrequency: "monthly" },
  { url: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { url: "/policy", priority: 0.3, changeFrequency: "yearly" },
  { url: "/social-media", priority: 0.5, changeFrequency: "monthly" },
  { url: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { url: "/ruju-ilal-quran", priority: 0.6, changeFrequency: "monthly" },
  { url: "/books-by-author", priority: 0.6, changeFrequency: "monthly" },
  { url: "/history-of-tanzeem-e-islami", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    changeFrequency: route.changeFrequency || "monthly",
    priority: route.priority || 0.5,
  }));

  // Fetch all dynamic entries in one batch; fall back to static-only if DB is unavailable
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [
      publishedPages,
      publishedAudios,
      publishedVideos,
      publishedBooks,
      publishedMagazines,
      publishedPressReleases,
      publishedEvents,
    ] = await Promise.all([
      db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.isPublished, true)),
      db.select({ slug: audio.slug, updatedAt: audio.updatedAt }).from(audio).where(eq(audio.isPublished, true)),
      db.select({ slug: videos.slug, updatedAt: videos.updatedAt }).from(videos).where(eq(videos.isPublished, true)),
      db.select({ slug: books.slug, updatedAt: books.updatedAt }).from(books).where(eq(books.isPublished, true)),
      db.select({ slug: magazines.slug, updatedAt: magazines.updatedAt }).from(magazines).where(eq(magazines.isPublished, true)),
      db.select({ slug: pressReleases.slug, updatedAt: pressReleases.updatedAt }).from(pressReleases).where(eq(pressReleases.isPublished, true)),
      db.select({ slug: events.slug, updatedAt: events.updatedAt }).from(events).where(eq(events.isPublished, true)),
    ]);

    dynamicEntries = [
      ...publishedPages.map((p) => ({ url: `${BASE_URL}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...publishedAudios.map((a) => ({ url: `${BASE_URL}/resources/audios/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
      ...publishedVideos.map((v) => ({ url: `${BASE_URL}/resources/videos/${v.slug}`, lastModified: v.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
      ...publishedBooks.map((b) => ({ url: `${BASE_URL}/resources/books/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
      ...publishedMagazines.map((m) => ({ url: `${BASE_URL}/resources/magazines/${m.slug}`, lastModified: m.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
      ...publishedPressReleases.map((p) => ({ url: `${BASE_URL}/resources/press-releases/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
      ...publishedEvents.map((e) => ({ url: `${BASE_URL}/events/${e.slug}`, lastModified: e.updatedAt, changeFrequency: "daily" as const, priority: 0.6 })),
    ];
  } catch {
    // DB unavailable during build — return static routes only
  }

  return [...staticEntries, ...dynamicEntries];
}
