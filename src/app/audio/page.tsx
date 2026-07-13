import { Suspense } from "react";
import { Metadata } from "next";
import { db } from "@/db";
import { audio, audioCategories, speakers } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { AudioListing } from "@/components/resources/AudioListing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audio Lectures | Tanzeem-e-Islami",
  description:
    "Listen to Islamic lectures, Bayan-ul-Quran, Dars-e-Quran, and speeches by Dr. Israr Ahmed and other scholars of Tanzeem-e-Islami.",
  keywords: ["audio lectures", "Dr. Israr Ahmed", "Bayan ul Quran", "Islamic audio", "Tanzeem"],
};

export default async function AudioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; speaker?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const categorySlug = sp.category ?? "";
  const speakerSlug = sp.speaker ?? "";
  const q = sp.q ?? "";
  const pageNum = Math.max(1, parseInt(sp.page ?? "1"));
  const PER_PAGE = 24;

  // Fetch categories and speakers for filter tabs
  const [categories, speakersList] = await Promise.all([
    db.select().from(audioCategories).orderBy(asc(audioCategories.order), asc(audioCategories.name)),
    db.select().from(speakers).orderBy(asc(speakers.order), asc(speakers.name)),
  ]);

  // Resolve filter IDs from slugs
  const activeCategoryId = categorySlug
    ? (categories.find((c) => c.slug === categorySlug)?.id ?? null)
    : null;
  const activeSpeakerId = speakerSlug
    ? (speakersList.find((s) => s.slug === speakerSlug)?.id ?? null)
    : null;

  // Build query filters
  const conditions: any[] = [eq(audio.isPublished, true)];
  if (activeCategoryId) conditions.push(eq(audio.categoryId, activeCategoryId));
  if (activeSpeakerId) conditions.push(eq(audio.speakerId, activeSpeakerId));

  const { and: drizzleAnd, like, or } = await import("drizzle-orm");
  if (q.trim()) {
    conditions.push(
      or(
        like(audio.title, `%${q.trim()}%`),
        like(audio.description, `%${q.trim()}%`)
      )
    );
  }

  const where = drizzleAnd(...conditions);
  const offset = (pageNum - 1) * PER_PAGE;

  const { count: drizzleCount } = await import("drizzle-orm");
  const [rows, totalResult] = await Promise.all([
    db.query.audio.findMany({
      where,
      with: { category: true, speaker: true },
      orderBy: [desc(audio.createdAt)],
      limit: PER_PAGE,
      offset,
    }),
    db.select({ total: drizzleCount() }).from(audio).where(where),
  ]);

  const total = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className=" bg-background">
      <Suspense>
        <AudioListing
          items={rows}
          categories={categories}
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
