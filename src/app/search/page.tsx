import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import {
  pages,
  posts,
  audio,
  videos,
  books,
  magazines,
  pressReleases,
  speakers,
  audioCategories,
  videoCategories,
  faqItems,
  socialAccounts,
} from "@/db/schema";
import { like, or, and, eq, inArray } from "drizzle-orm";
import { Search, Calendar, FileText, Music, Video, Book, Newspaper, AlertCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResultsClient } from "@/components/search/SearchResultsClient";
import { LiveSearchInput } from "@/components/search/LiveSearchInput";

import { getSearchVariations } from "@/lib/search-synonyms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Results | Tanzeem-e-Islami",
  description: "Search across all resources, publications, audios, videos and pages.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").substring(0, 160) + (html.length > 160 ? "..." : "");
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const searchTerm = q?.trim() || "";
  const searchVariations = getSearchVariations(searchTerm);
  const patterns = searchVariations.map((v) => `%${v}%`);

  const buildLikeConditions = (column: any) =>
    or(...patterns.map((p) => like(column, p)))!;

  let results: {
    id: string;
    title: string;
    description: string;
    type: "page" | "post" | "audio" | "video" | "book" | "magazine" | "press_release" | "faq" | "social" | "speaker" | "audio_category" | "video_category";
    link: string;
    date?: Date | string | null;
  }[] = [];

  if (searchTerm && patterns.length > 0) {
    try {
      // First find matching speakers to retrieve their IDs for cross-relational search
      const matchingSpeakers = await db
        .select({ id: speakers.id, name: speakers.name })
        .from(speakers)
        .where(or(buildLikeConditions(speakers.name), buildLikeConditions(speakers.bio)));
      const matchingSpeakerIds = matchingSpeakers.map((s) => s.id);

      const [
        pagesRes, postsRes, audiosRes, videosRes, booksRes, magazinesRes, pressRes,
        speakersRes, audioCatRes, videoCatRes, faqRes, socialRes
      ] = await Promise.all([
        db.select().from(pages).where(and(eq(pages.isPublished, true), or(buildLikeConditions(pages.title), buildLikeConditions(pages.content)))).limit(15),
        db.select().from(posts).where(and(eq(posts.isPublished, true), or(buildLikeConditions(posts.title), buildLikeConditions(posts.content)))).limit(15),
        
        // Search Audio by title, description OR speaker match
        db.select().from(audio).where(
          and(
            eq(audio.isPublished, true),
            or(
              buildLikeConditions(audio.title),
              buildLikeConditions(audio.description),
              matchingSpeakerIds.length > 0 ? inArray(audio.speakerId, matchingSpeakerIds) : undefined
            )
          )
        ).limit(25),
        
        // Search Videos by title, description, videoUrl OR speaker match
        db.select().from(videos).where(
          and(
            eq(videos.isPublished, true),
            or(
              buildLikeConditions(videos.title),
              buildLikeConditions(videos.description),
              buildLikeConditions(videos.videoUrl),
              matchingSpeakerIds.length > 0 ? inArray(videos.speakerId, matchingSpeakerIds) : undefined
            )
          )
        ).limit(25),

        // Search Books by title, description OR author/speaker match
        db.select().from(books).where(
          and(
            eq(books.isPublished, true),
            or(
              buildLikeConditions(books.title),
              buildLikeConditions(books.description),
              buildLikeConditions(books.authorName)
            )
          )
        ).limit(15),

        // Search Magazines by title, description
        db.select().from(magazines).where(and(eq(magazines.isPublished, true), or(buildLikeConditions(magazines.title), buildLikeConditions(magazines.description)))).limit(15),
        db.select().from(pressReleases).where(and(eq(pressReleases.isPublished, true), or(buildLikeConditions(pressReleases.title), buildLikeConditions(pressReleases.content)))).limit(15),
        db.select().from(speakers).where(or(buildLikeConditions(speakers.name), buildLikeConditions(speakers.bio))).limit(10),
        db.select().from(audioCategories).where(buildLikeConditions(audioCategories.name)).limit(10),
        db.select().from(videoCategories).where(buildLikeConditions(videoCategories.name)).limit(10),
        db.select().from(faqItems).where(and(eq(faqItems.isPublished, true), or(buildLikeConditions(faqItems.question), buildLikeConditions(faqItems.answer)))).limit(10),
        db.select().from(socialAccounts).where(and(eq(socialAccounts.isActive, true), or(buildLikeConditions(socialAccounts.title), buildLikeConditions(socialAccounts.url)))).limit(5),
      ]);

      const normalizedPages = pagesRes.map((p) => ({ id: p.id, title: p.title, description: stripHtml(p.content), type: "page" as const, link: `/${p.slug}`, date: p.publishedAt || p.createdAt }));
      const normalizedPosts = postsRes.map((p) => ({ id: p.id, title: p.title, description: stripHtml(p.content), type: "post" as const, link: `/resources`, date: p.publishedAt || p.createdAt }));
      const normalizedAudios = audiosRes.map((a) => ({ id: a.id, title: a.title, description: stripHtml(a.description || ""), type: "audio" as const, link: `/audio/${a.slug}`, date: a.publishedAt || a.createdAt }));
      const normalizedVideos = videosRes.map((v) => ({ id: v.id, title: v.title, description: stripHtml(v.description || ""), type: "video" as const, link: `/resources/videos/${v.slug}`, date: v.publishedAt || v.createdAt }));
      const normalizedBooks = booksRes.map((b) => ({ id: b.id, title: b.title, description: stripHtml(b.description || ""), type: "book" as const, link: `/resources/books/${b.slug}`, date: b.publishedAt || b.createdAt }));
      const normalizedMagazines = magazinesRes.map((m) => ({ id: m.id, title: m.title, description: stripHtml(m.description || ""), type: "magazine" as const, link: `/resources/magazines/${m.slug}`, date: m.publishDate || m.createdAt }));
      const normalizedPress = pressRes.map((p) => ({ id: p.id, title: p.title, description: stripHtml(p.excerpt || p.content), type: "press_release" as const, link: `/press-releases/${p.slug}`, date: p.publishedAt || p.createdAt }));
      const normalizedSpeakers = speakersRes
        .filter((s) => !s.slug.endsWith("-1"))
        .map((s) => ({ id: s.id, title: s.name, description: stripHtml(s.bio || ""), type: "speaker" as const, link: `/audios-by-speaker/${s.slug}` }));
      const normalizedAudioCats = audioCatRes
        .filter((c) => !c.slug.endsWith("-1"))
        .map((c) => ({ id: c.id, title: c.name, description: "Audio Category", type: "audio_category" as const, link: `/audios-by-category/${c.slug}` }));
      const normalizedVideoCats = videoCatRes
        .filter((c) => !c.slug.endsWith("-1"))
        .map((c) => ({ id: c.id, title: c.name, description: "Video Category", type: "video_category" as const, link: `/videos-by-category/${c.slug}` }));
      const normalizedFaqs = faqRes.map((f) => ({ id: f.id, title: f.question, description: stripHtml(f.answer), type: "faq" as const, link: `/faqs`, date: f.createdAt }));
      const normalizedSocial = socialRes.map((s) => ({ id: s.id, title: s.title, description: s.url, type: "social" as const, link: s.url, date: s.createdAt }));

      results = [
        ...normalizedPages, ...normalizedPosts, ...normalizedAudios, ...normalizedVideos,
        ...normalizedBooks, ...normalizedMagazines, ...normalizedPress,
        ...normalizedSpeakers, ...normalizedAudioCats, ...normalizedVideoCats,
        ...normalizedFaqs, ...normalizedSocial
      ];
    } catch (error) {
      console.error("Search query execution error:", error);
    }
  }



  return (
    <main className="min-h-screen bg-background py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Search header */}
        {/* <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-5xl font-bold text-primary mb-4">
            Tanzeem Search Portal
          </h1>
          <p className="text-foreground-muted text-sm md:text-md max-w-md mx-auto">
            Discover audio lectures, video series, books, monthly magazines, and official announcements.
          </p>
        </div> */}

        {/* Search input bar */}
        <div className="mb-6">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted z-10" />
              <LiveSearchInput defaultValue={searchTerm} />
            </div>
            <Button className="h-12 px-6 bg-primary text-white font-semibold rounded-full">
              Search
            </Button>
          </div>
        </div>


        {searchTerm ? (
          <SearchResultsClient results={results} searchTerm={searchTerm} />
        ) : (
          <div className="text-center py-8 bg-card border border-dashed border-border rounded-xl">
            <Search className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Ready to Search</h3>
            <p className="text-sm text-foreground-muted max-w-sm mx-auto">
              Enter a search query above to start exploring Tanzeem-e-Islami publications, speeches, and resources.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
