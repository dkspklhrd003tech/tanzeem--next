import { db } from "@/db";
import {
  audio,
  videos,
  books,
  magazines,
  speakers,
  audioCategories,
  pressReleases,
  locations,
} from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";

export async function getPublishedAudio(opts?: {
  speakerId?: string;
  categoryId?: string;
  searchSlug?: string;
  limit?: number;
}) {
  const conditions = [eq(audio.isPublished, true)];
  if (opts?.speakerId) conditions.push(eq(audio.speakerId, opts.speakerId));
  if (opts?.categoryId) conditions.push(eq(audio.categoryId, opts.categoryId));

  const rows = await db.query.audio.findMany({
    where: and(...conditions),
    with: { speaker: true, category: true },
    orderBy: [desc(audio.publishedAt), desc(audio.createdAt)],
    limit: opts?.limit ?? 100,
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    audioUrl: r.audioUrl,
    thumbnailUrl: r.thumbnailUrl,
    publishedAt: r.publishedAt,
    speakerName: r.speaker?.name ?? null,
    categoryName: r.category?.name ?? null,
    speakerId: r.speakerId,
    categoryId: r.categoryId,
  }));
}

export async function getPublishedVideos(limit = 100) {
  const rows = await db.query.videos.findMany({
    where: eq(videos.isPublished, true),
    with: { speaker: true, category: true },
    orderBy: [desc(videos.publishedAt), desc(videos.createdAt)],
    limit,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    videoUrl: r.videoUrl,
    thumbnailUrl: r.thumbnailUrl,
    speakerName: r.speaker?.name ?? null,
    categoryName: r.category?.name ?? null,
  }));
}

export async function getPublishedBooks(limit = 100) {
  const rows = await db.query.books.findMany({
    where: eq(books.isPublished, true),
    with: { category: true },
    orderBy: [desc(books.publishedAt), desc(books.createdAt)],
    limit,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    authorName: r.authorName,
    coverImage: r.coverImage,
    fileUrl: r.fileUrl,
    description: r.description,
    categoryName: r.category?.name ?? null,
  }));
}

export async function getMagazinesBySeries(seriesSlug: string) {
  const rows = await db.query.magazines.findMany({
    where: and(eq(magazines.isPublished, true), like(magazines.slug, `%${seriesSlug}%`)),
    orderBy: [desc(magazines.publishDate), desc(magazines.createdAt)],
    limit: 50,
  });
  return rows;
}

export async function getAllPublishedMagazines() {
  return db.query.magazines.findMany({
    where: eq(magazines.isPublished, true),
    orderBy: [desc(magazines.publishDate)],
    limit: 100,
  });
}

export async function getSpeakersWithCounts() {
  const allSpeakers = await db.select().from(speakers).orderBy(speakers.name);
  const audioCounts = await db.select().from(audio).where(eq(audio.isPublished, true));
  return allSpeakers.map((s) => ({
    ...s,
    audioCount: audioCounts.filter((a) => a.speakerId === s.id).length,
  }));
}

export async function getAudioCategories() {
  return db.select().from(audioCategories).orderBy(audioCategories.name);
}

export async function getPressReleases(limit = 50) {
  return db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.isPublished, true))
    .orderBy(desc(pressReleases.publishedAt), desc(pressReleases.createdAt))
    .limit(limit);
}

export async function getActiveLocations() {
  return db
    .select()
    .from(locations)
    .where(eq(locations.isActive, true))
    .orderBy(locations.city);
}
