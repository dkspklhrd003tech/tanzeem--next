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
} from "@/db/schema";
import { like, or, and, eq } from "drizzle-orm";
import { Search, Calendar, FileText, Music, Video, Book, Newspaper, AlertCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const queryPattern = `%${searchTerm}%`;

  let results: {
    id: string;
    title: string;
    description: string;
    type: "page" | "post" | "audio" | "video" | "book" | "magazine" | "press_release";
    link: string;
    date?: Date | string | null;
  }[] = [];

  if (searchTerm) {
    try {
      const [pagesRes, postsRes, audiosRes, videosRes, booksRes, magazinesRes, pressRes] =
        await Promise.all([
          db
            .select()
            .from(pages)
            .where(
              and(
                eq(pages.isPublished, true),
                or(like(pages.title, queryPattern), like(pages.content, queryPattern))
              )
            )
            .limit(10),
          db
            .select()
            .from(posts)
            .where(
              and(
                eq(posts.isPublished, true),
                or(like(posts.title, queryPattern), like(posts.content, queryPattern))
              )
            )
            .limit(10),
          db
            .select()
            .from(audio)
            .where(
              and(
                eq(audio.isPublished, true),
                or(like(audio.title, queryPattern), like(audio.description, queryPattern))
              )
            )
            .limit(10),
          db
            .select()
            .from(videos)
            .where(
              and(
                eq(videos.isPublished, true),
                or(like(videos.title, queryPattern), or(like(videos.description, queryPattern), like(videos.videoUrl, queryPattern)))
              )
            )
            .limit(10),
          db
            .select()
            .from(books)
            .where(
              and(
                eq(books.isPublished, true),
                or(like(books.title, queryPattern), like(books.description, queryPattern))
              )
            )
            .limit(10),
          db
            .select()
            .from(magazines)
            .where(
              and(
                eq(magazines.isPublished, true),
                or(like(magazines.title, queryPattern), like(magazines.description, queryPattern))
              )
            )
            .limit(10),
          db
            .select()
            .from(pressReleases)
            .where(
              and(
                eq(pressReleases.isPublished, true),
                or(like(pressReleases.title, queryPattern), like(pressReleases.content, queryPattern))
              )
            )
            .limit(10),
        ]);

      // Normalize and combine
      const normalizedPages = pagesRes.map((p) => ({
        id: p.id,
        title: p.title,
        description: stripHtml(p.content),
        type: "page" as const,
        link: `/${p.slug}`,
        date: p.publishedAt || p.createdAt,
      }));

      const normalizedPosts = postsRes.map((p) => ({
        id: p.id,
        title: p.title,
        description: stripHtml(p.content),
        type: "post" as const,
        link: `/resources`, // Fallback link
        date: p.publishedAt || p.createdAt,
      }));

      const normalizedAudios = audiosRes.map((a) => ({
        id: a.id,
        title: a.title,
        description: stripHtml(a.description || ""),
        type: "audio" as const,
        link: `/audio/${a.slug}`,
        date: a.publishedAt || a.createdAt,
      }));

      const normalizedVideos = videosRes.map((v) => ({
        id: v.id,
        title: v.title,
        description: stripHtml(v.description || ""),
        type: "video" as const,
        link: `/resources/videos/${v.slug}`,
        date: v.publishedAt || v.createdAt,
      }));

      const normalizedBooks = booksRes.map((b) => ({
        id: b.id,
        title: b.title,
        description: stripHtml(b.description || ""),
        type: "book" as const,
        link: `/resources/books/${b.slug}`,
        date: b.publishedAt || b.createdAt,
      }));

      const normalizedMagazines = magazinesRes.map((m) => ({
        id: m.id,
        title: m.title,
        description: stripHtml(m.description || ""),
        type: "magazine" as const,
        link: `/resources/magazines/${m.slug}`,
        date: m.publishDate || m.createdAt,
      }));

      const normalizedPress = pressRes.map((p) => ({
        id: p.id,
        title: p.title,
        description: stripHtml(p.excerpt || p.content),
        type: "press_release" as const,
        link: `/press-releases/${p.slug}`,
        date: p.publishedAt || p.createdAt,
      }));

      results = [
        ...normalizedPages,
        ...normalizedPosts,
        ...normalizedAudios,
        ...normalizedVideos,
        ...normalizedBooks,
        ...normalizedMagazines,
        ...normalizedPress,
      ];
    } catch (error) {
      console.error("Search query execution error:", error);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "page":
      case "post":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "audio":
        return <Music className="h-4 w-4 text-green-500" />;
      case "video":
        return <Video className="h-4 w-4 text-red-500" />;
      case "book":
        return <Book className="h-4 w-4 text-amber-500" />;
      case "magazine":
        return <Newspaper className="h-4 w-4 text-purple-500" />;
      case "press_release":
        return <Newspaper className="h-4 w-4 text-emerald-500" />;
      default:
        return <FileText className="h-4 w-4 text-foreground" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "page":
        return "Page";
      case "post":
        return "Article";
      case "audio":
        return "Audio Lecture";
      case "video":
        return "Video Lecture";
      case "book":
        return "Book";
      case "magazine":
        return "Magazine Issue";
      case "press_release":
        return "Press Release";
      default:
        return "Resource";
    }
  };

  return (
    <main className=" bg-background px-4 pt-6 pb-8 md:py-16">
      <div className="container mx-auto max-w-4xl">
        {/* Search header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-5xl font-bold text-primary mb-4">
            Tanzeem Search Portal
          </h1>
          <p className="text-foreground-muted text-sm md:text-md max-w-md mx-auto">
            Discover audio lectures, video series, books, monthly magazines, and official announcements.
          </p>
        </div>

        {/* Search input bar */}
        <div className="mb-6">
          <form action="/search" method="GET" className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <Input
                name="q"
                defaultValue={searchTerm}
                placeholder="Search resources, topics, or speakers..."
                className="pl-12 h-12 text-md bg-[#fefefc] border-border rounded-md"
                autoFocus
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-primary hover:bg-primary/95 text-white font-semibold rounded-md">
              Search
            </Button>
          </form>
        </div>

        {/* Results title */}
        {searchTerm && (
          <div className="mb-6 pb-2 border-b border-border flex justify-between items-center">
            <h2 className="text-sm font-semibold text-foreground-muted">
              Found {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{searchTerm}&rdquo;
            </h2>
          </div>
        )}

        {/* Search Results list */}
        {searchTerm ? (
          results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 space-y-4">
              {results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-card border border-border/80 hover:border-primary/30 rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-[10px] font-semibold tracking-wide text-foreground-muted">
                      {getTypeIcon(item.type)}
                      {getTypeName(item.type)}
                    </span>
                    {item.date && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.date).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground hover:text-primary mb-2 line-clamp-3">
                    <Link href={item.link}>{item.title}</Link>
                  </h3>
                  <div className="mt-4 flex justify-start">
                    <Link
                      href={item.link}
                      className="text-sm font-semibold text-primary p-2 border border-[#0d5844] rounded-sm flex items-center gap-1 group"
                    >
                      Explore {getTypeName(item.type)}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
              <AlertCircle className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Results Found</h3>
              <p className="text-sm text-foreground-muted max-w-sm mx-auto">
                We couldn&rsquo;t find anything matching &ldquo;{searchTerm}&rdquo;. Please verify your spelling or try different keywords.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
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
