import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AudioList } from "@/components/resources/AudioList";
import { VideoGrid, ExternalVideoLinks } from "@/components/resources/VideoGrid";
import { BookGrid } from "@/components/resources/BookGrid";
import { SpeakerGrid } from "@/components/resources/SpeakerGrid";
import { MagazineGrid } from "@/components/resources/MagazineGrid";
import { LatestPressReleases } from "@/components/home/LatestPressReleases";
import {
  getPublishedAudio,
  getPublishedVideos,
  getPublishedBooks,
  getMagazinesBySeries,
  getSpeakersWithCounts,
  getAudioCategories,
  getPressReleases,
} from "@/lib/resources";
import type { magazines } from "@/db/schema";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  audios: "Audio Library",
  "audios/by-speaker": "Audios by Speaker",
  "audios/by-category": "Audios by Category",
  "audio-books": "Audio Books",
  videos: "Video Library",
  "videos/by-category": "Videos by Category",
  "videos/by-speakers": "Videos by Speakers",
  books: "Books",
  "books/by-category": "Books by Category",
  magazines: "Magazines",
  "magazines/meesaq": "Meesaq",
  "magazines/hikmat-e-quran": "Hikmat-e-Quran",
  "magazines/nida-e-khilafat": "Nida-e-Khilafat",
  "press-releases": "Press Releases",
  "social-media": "Social Media",
  "khitab-e-jumah": "Khitab-e-Jum'ah",
};

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ speaker?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const title = TITLES[slug.join("/")] || "Resources";
  return { title: `${title} | Tanzeem-e-Islami` };
}

function mapMagazine(m: typeof magazines.$inferSelect) {
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

  if (!title) notFound();
  if (path === "social-media") redirect("/social-media");

  const [audioItems, videoItems, bookItems, speakerList, categories, pressItems] =
    await Promise.all([
      getPublishedAudio(
        sp.speaker ? { speakerId: sp.speaker } : undefined
      ),
      getPublishedVideos(),
      getPublishedBooks(),
      getSpeakersWithCounts(),
      getAudioCategories(),
      getPressReleases(30),
    ]);

  return (
    <div className="container mx-auto py-12 md:py-16 px-4">
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
        <AudioList
          items={audioItems}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
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

      {(path === "books" || path === "books/by-category") && <BookGrid items={bookItems} />}

      {path === "magazines" && (
        <div className="space-y-12">
          <MagazineGrid
            seriesTitle="Meesaq"
            items={(await getMagazinesBySeries("meesaq")).map(mapMagazine)}
          />
          <MagazineGrid
            seriesTitle="Hikmat-e-Quran"
            items={(await getMagazinesBySeries("hikmat")).map(mapMagazine)}
          />
          <MagazineGrid
            seriesTitle="Nida-e-Khilafat"
            items={(await getMagazinesBySeries("nida")).map(mapMagazine)}
          />
        </div>
      )}

      {path === "magazines/meesaq" && (
        <MagazineGrid items={(await getMagazinesBySeries("meesaq")).map(mapMagazine)} />
      )}
      {path === "magazines/hikmat-e-quran" && (
        <MagazineGrid items={(await getMagazinesBySeries("hikmat")).map(mapMagazine)} />
      )}
      {path === "magazines/nida-e-khilafat" && (
        <MagazineGrid items={(await getMagazinesBySeries("nida")).map(mapMagazine)} />
      )}

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
