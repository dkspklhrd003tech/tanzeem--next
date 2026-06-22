import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { audio, videos, books, magazines, pressReleases, speakers, audioCategories } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { AudioList } from "@/components/resources/AudioList";
import { VideoGrid, ExternalVideoLinks } from "@/components/resources/VideoGrid";
import { BookGrid } from "@/components/resources/BookGrid";
import { SpeakerGrid } from "@/components/resources/SpeakerGrid";
import { MagazineGrid } from "@/components/resources/MagazineGrid";
import { LatestPressReleases } from "@/components/home/LatestPressReleases";
import { AudioDetail } from "@/components/resources/AudioDetail";
import { VideoDetail } from "@/components/resources/VideoDetail";
import { BookDetail } from "@/components/resources/BookDetail";
import {
  getPublishedAudio,
  getPublishedVideos,
  getPublishedBooks,
  getMagazinesBySeries,
  getSpeakersWithCounts,
  getAudioCategories,
  getPressReleases,
} from "@/lib/resources";
import type { magazines as MagazinesTable } from "@/db/schema";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  audios: "Audio Library",
  "audios/by-speaker": "Audios by Speaker",
  "audios/by-category": "Audios by Category",
  "audio-books": "Audio Books",
  videos: "Video Library",
  "videos/by-category": "Videos by Category",
  "videos/by-speakers": "Videos by Speakers",
  "dr-israr-ahmad-lectures": "Dr. Israr Ahmad Lectures",
  "dr-israr-ahmad-qa": "Dr. Israr Ahmad (Q&A)",
  "bayan-ul-quran": "Bayan ul Quran",
  "muntakab-nisab": "Muntakab Nisab",
  "dr-israr-ahmad-video-clips": "Dr. Israr Ahmad (Video Clips)",
  books: "Books",
  "books/by-category": "Books by Category",
  magazines: "Magazines",
  "magazines/meesaq": "Meesaq",
  "magazines/hikmat-e-quran": "Hikmat-e-Quran",
  "magazines/nida-e-khilafat": "Nida-e-Khilafat",
  "magazines/perspective": "Perspective",
  "press-releases": "Press Releases",
  "social-media": "Social Media",
  "khitab-e-jumah": "Khitab-e-Jum'ah",
};

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ speaker?: string; category?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const title = TITLES[path];
  if (title) return { title: `${title} | Tanzeem-e-Islami` };

  // Check if this is an individual item detail
  const itemSlug = slug[slug.length - 1];
  const parentPath = slug.slice(0, -1).join("/");

  const entity = await findItemBySlug(parentPath, itemSlug);
  if (entity) {
    return { title: `${entity.title} | Tanzeem-e-Islami` };
  }

  return { title: "Not Found | Tanzeem-e-Islami" };
}

async function findItemBySlug(parentPath: string, itemSlug: string) {
  let entity;
  if (parentPath === "audios" || parentPath === "audio-books" || parentPath === "khitab-e-jumah") {
    entity = await db.query.audio.findFirst({ where: and(eq(audio.slug, itemSlug), eq(audio.isPublished, true)) });
  } else if (parentPath === "videos") {
    entity = await db.query.videos.findFirst({ where: and(eq(videos.slug, itemSlug), eq(videos.isPublished, true)) });
  } else if (parentPath === "books") {
    entity = await db.query.books.findFirst({ where: and(eq(books.slug, itemSlug), eq(books.isPublished, true)) });
  } else if (parentPath.startsWith("magazines/")) {
    entity = await db.query.magazines.findFirst({ where: and(eq(magazines.slug, itemSlug), eq(magazines.isPublished, true)) });
  } else if (parentPath === "press-releases") {
    entity = await db.query.pressReleases.findFirst({ where: and(eq(pressReleases.slug, itemSlug), eq(pressReleases.isPublished, true)) });
  }
  return entity;
}

function mapMagazine(m: typeof MagazinesTable.$inferSelect) {
  return {
    id: m.id,
    title: m.title,
    issueNumber: m.issueNumber,
    coverImage: m.coverImage,
    fileUrl: m.fileUrl,
    publishDate: m.publishDate,
  };
}

export default async function ResourceSubPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const sp = await searchParams;
  const title = TITLES[path];

  // Handle redirects
  if (path === "social-media") redirect("/social-media");

  // If known listing page — render existing grid/list
  if (title) {
    const [audioItems, videoItems, bookItems, speakerList, categories, pressItems] =
      await Promise.all([
        getPublishedAudio(sp.speaker ? { speakerId: sp.speaker } : undefined),
        getPublishedVideos(),
        getPublishedBooks(),
        getSpeakersWithCounts(),
        getAudioCategories(),
        getPressReleases(30),
      ]);

    return (
      <div className="container mx-auto py-8 md:py-10 px-4">
        <div className="max-w-4xl mb-8">
          <Link href="/resources" className="text-sm text-primary hover:underline">
            ← Resources
          </Link>
          <h1 className="font-amiri text-3xl md:text-4xl font-bold text-primary mt-2">{title}</h1>
        </div>

        {path === "audios" && (
          <AudioList
            items={audioItems}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            speakers={speakerList.map((s) => ({ id: s.id, name: s.name }))}
          />
        )}
        {path === "audios/by-speaker" && (
          <>
            <SpeakerGrid speakers={speakerList} />
            {sp.speaker && (
              <div className="mt-12">
                <h2 className="font-amiri text-xl font-bold text-primary mb-4">Lectures</h2>
                <AudioList items={audioItems} showFilters={false} />
              </div>
            )}
          </>
        )}
        {path === "audios/by-category" && (
          <AudioList items={audioItems} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
        )}
        {(path === "audio-books" || path === "khitab-e-jumah") && (
          <AudioList items={audioItems} showFilters={path === "audio-books"} />
        )}
        {path === "videos" && (
          <>
            <ExternalVideoLinks />
            <h2 className="font-amiri text-xl font-bold text-primary mb-4 mt-4">Tanzeem Videos</h2>
            <VideoGrid items={videoItems} />
          </>
        )}
        {(path === "videos/by-category" || path === "videos/by-speakers") && (
          <VideoGrid items={videoItems} />
        )}
        {["dr-israr-ahmad-lectures", "dr-israr-ahmad-qa", "bayan-ul-quran", "muntakab-nisab", "dr-israr-ahmad-video-clips"].includes(path) && (
          <>
            <div className="mb-6">
              <p className="text-foreground-muted">Curated video playlists and series.</p>
            </div>
            <VideoGrid items={videoItems} />
          </>
        )}
        {(path === "books" || path === "books/by-category") && <BookGrid items={bookItems} />}
        {path === "magazines" && (
          <div className="space-y-12">
            {await renderMagazineSeries("meesaq", "Meesaq")}
            {await renderMagazineSeries("hikmat", "Hikmat-e-Quran")}
            {await renderMagazineSeries("nida", "Nida-e-Khilafat")}
          </div>
        )}
        {path === "magazines/meesaq" && <MagazineGrid items={(await getMagazinesBySeries("meesaq")).map(mapMagazine)} />}
        {path === "magazines/hikmat-e-quran" && <MagazineGrid items={(await getMagazinesBySeries("hikmat")).map(mapMagazine)} />}
        {path === "magazines/nida-e-khilafat" && <MagazineGrid items={(await getMagazinesBySeries("nida")).map(mapMagazine)} />}
        {path === "magazines/perspective" && <MagazineGrid items={(await getMagazinesBySeries("perspective")).map(mapMagazine)} />}
        {path === "press-releases" && (
          <LatestPressReleases
            items={pressItems.map((p) => ({
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              content: p.content,
              publishedAt: p.publishedAt,
            }))}
          />
        )}
      </div>
    );
  }

  // --- Magazine yearly archives (e.g. magazines/meesaq/2024) ---
  if (slug.length === 3 && slug[0] === "magazines") {
    const seriesSlug = slug[1];
    const year = slug[2];
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum) && ["meesaq", "hikmat-e-quran", "nida-e-khilafat", "perspective"].includes(seriesSlug)) {
      const seriesKey = seriesSlug === "hikmat-e-quran" ? "hikmat" : seriesSlug === "nida-e-khilafat" ? "nida" : seriesSlug;
      const items = (await getMagazinesBySeries(seriesKey))
        .filter((m) => m.publishDate && new Date(m.publishDate).getFullYear() === yearNum)
        .map(mapMagazine);

      const seriesTitle = TITLES[`magazines/${seriesSlug}`] || seriesSlug;
      return (
        <div className="container mx-auto py-8 md:py-10 px-4">
          <Link href={`/resources/magazines/${seriesSlug}`} className="text-sm text-primary hover:underline">
            ← {seriesTitle}
          </Link>
          <h1 className="font-amiri text-3xl md:text-4xl font-bold text-primary mt-2">
            {seriesTitle} — {year}
          </h1>
          {items.length > 0 ? (
            <div className="mt-8">
              <MagazineGrid items={items} />
            </div>
          ) : (
            <p className="mt-8 text-muted-foreground">No issues found for {year}.</p>
          )}
        </div>
      );
    }
  }

  // --- Individual item detail pages ---
  const itemSlug = slug[slug.length - 1];
  const parentPath = slug.slice(0, -1).join("/");

  const entity = await findItemBySlug(parentPath, itemSlug);

  if (!entity) notFound();

  // Back link
  const backHref = `/resources/${parentPath}`;
  const backLabel = TITLES[parentPath] || "Resources";

  if (parentPath === "audios" || parentPath === "audio-books" || parentPath === "khitab-e-jumah") {
    return (
      <AudioDetail
        audio={entity as any}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (parentPath === "videos") {
    return (
      <VideoDetail
        video={entity as any}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (parentPath === "books") {
    return (
      <BookDetail
        book={entity as any}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (parentPath.startsWith("magazines/")) {
    const m = entity as typeof MagazinesTable.$inferSelect;
    return (
      <div className="container mx-auto py-8 md:py-10 px-4">
        <Link href={`/resources/${parentPath}`} className="text-sm text-primary hover:underline">
          ← {TITLES[parentPath] || "Magazines"}
        </Link>
        <MagazineGrid items={[mapMagazine(m)]} />
      </div>
    );
  }

  if (parentPath === "press-releases") {
    const pr = entity as any;
    return (
      <div className="container mx-auto py-8 md:py-10 px-4">
        <Link href="/resources/press-releases" className="text-sm text-primary hover:underline">
          ← Press Releases
        </Link>
        <article className="max-w-4xl mx-auto mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{pr.title}</h1>
          {pr.publishedAt && (
            <p className="text-muted-foreground mb-6">
              {new Date(pr.publishedAt).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          )}
          {pr.featuredImage && (
            <img src={pr.featuredImage} alt={pr.title} className="w-full aspect-video rounded-xl object-cover mb-8 shadow-lg" />
          )}
          <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: pr.content || pr.excerpt || "" }} />
        </article>
      </div>
    );
  }

  notFound();
}

async function renderMagazineSeries(slug: string, title: string) {
  const items = (await getMagazinesBySeries(slug)).map(mapMagazine);
  if (!items.length) return null;
  return <MagazineGrid key={slug} seriesTitle={title} items={items} />;
}
