import { Suspense } from "react";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { videos, videoCategories, speakers } from "@/db/schema";
import { eq, desc, asc, and, like, or, count } from "drizzle-orm";
import { VideoListing } from "@/components/resources/VideoListing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Lectures | Tanzeem-e-Islami",
  description:
    "Watch Islamic video lectures, Bayan-ul-Quran, Dars-e-Quran, and speeches by Dr. Israr Ahmed and scholars of Tanzeem-e-Islami.",
  keywords: ["video lectures", "Dr. Israr Ahmed", "Islamic video", "Bayan ul Quran", "Tanzeem"],
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; speaker?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const categorySlug = sp.category ?? "";
  const speakerSlug  = sp.speaker  ?? "";
  const q            = sp.q        ?? "";
  const pageNum      = Math.max(1, parseInt(sp.page ?? "1"));
  const PER_PAGE     = 24;

  const [cats, speakersList] = await Promise.all([
    db.select().from(videoCategories).orderBy(asc(videoCategories.name)),
    db.select().from(speakers).orderBy(asc(speakers.name)),
  ]);

  const activeCatId = categorySlug ? (cats.find((c) => c.slug === categorySlug)?.id ?? null) : null;
  const activeSpId  = speakerSlug  ? (speakersList.find((s) => s.slug === speakerSlug)?.id ?? null) : null;

  const conditions: any[] = [eq(videos.isPublished, true)];
  if (activeCatId) conditions.push(eq(videos.categoryId, activeCatId));
  if (activeSpId)  conditions.push(eq(videos.speakerId,  activeSpId));
  if (q.trim())    conditions.push(or(like(videos.title, `%${q.trim()}%`), like(videos.description, `%${q.trim()}%`)));

  const where  = and(...conditions);
  const offset = (pageNum - 1) * PER_PAGE;

  const [rows, totalResult] = await Promise.all([
    db.query.videos.findMany({
      where,
      with: { category: true, speaker: true },
      orderBy: [desc(videos.createdAt)],
      limit: PER_PAGE,
      offset,
    }),
    db.select({ total: count() }).from(videos).where(where),
  ]);

  const total      = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="min-h-screen bg-background">
      <Suspense>
        <VideoListing
          items={rows}
          categories={cats}
          speakers={speakersList}
          activeCategorySlug={categorySlug}
          activeSpeakerSlug={speakerSlug}
          searchQuery={q}
          page={pageNum}
          totalPages={totalPages}
          total={total}
        />
      </Suspense>
    </main>
  );
}
