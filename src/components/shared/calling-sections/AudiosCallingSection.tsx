import { db } from "@/lib/db";
import { audio, audioCategories, speakers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { MediaCardGrid } from "@/components/shared/MediaCardGrid";

interface CallingSectionProps {
  heading?: string;
  fetchUrl?: string;
  limit?: number;
  buttonLabel?: string;
  buttonUrl?: string;
}

export async function AudiosCallingSection({ heading, fetchUrl, limit = 6, buttonLabel, buttonUrl }: CallingSectionProps) {
  let slug = "";
  if (fetchUrl) {
    const parts = fetchUrl.split("/").filter(Boolean);
    slug = parts[parts.length - 1] || "";
  }

  let speakerId: string | null = null;
  let categoryId: string | null = null;

  if (slug) {
    const [sp] = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1);
    if (sp) {
      speakerId = sp.id;
    } else {
      const [cat] = await db.select().from(audioCategories).where(eq(audioCategories.slug, slug)).limit(1);
      if (cat) {
        categoryId = cat.id;
      }
    }
  }

  const results = await db.select({
      audio: audio,
      speaker: speakers
    })
    .from(audio)
    .leftJoin(speakers, eq(audio.speakerId, speakers.id))
    .where(
      and(
        eq(audio.isPublished, true),
        speakerId ? eq(audio.speakerId, speakerId) : undefined,
        categoryId ? eq(audio.categoryId, categoryId) : undefined
      )
    )
    .orderBy(desc(audio.createdAt))
    .limit(limit);

  if (results.length === 0) return null;

  const items = results.map(row => ({
    title: row.audio.title,
    image: row.audio.thumbnailUrl || row.speaker?.profileImage || "",
    type: "audio" as const,
    link: `/audio/${row.audio.slug}`
  }));

  return (
    <MediaCardGrid
      heading={heading}
      items={items}
      columns={3}
      viewAllUrl={buttonUrl}
      viewAllLabel={buttonLabel}
    />
  );
}
