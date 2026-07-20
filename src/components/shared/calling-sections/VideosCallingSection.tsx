import { db } from "@/lib/db";
import { videos, videoCategories, speakers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { MediaCardGrid } from "@/components/shared/MediaCardGrid";

interface CallingSectionProps {
  heading?: string;
  fetchUrl?: string;
  limit?: number;
  buttonLabel?: string;
  buttonUrl?: string;
}

export async function VideosCallingSection({ heading, fetchUrl, limit = 6, buttonLabel, buttonUrl }: CallingSectionProps) {
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
      const [cat] = await db.select().from(videoCategories).where(eq(videoCategories.slug, slug)).limit(1);
      if (cat) {
        categoryId = cat.id;
      }
    }
  }

  const results = await db.select({
      video: videos,
      speaker: speakers
    })
    .from(videos)
    .leftJoin(speakers, eq(videos.speakerId, speakers.id))
    .where(
      and(
        eq(videos.isPublished, true),
        speakerId ? eq(videos.speakerId, speakerId) : undefined,
        categoryId ? eq(videos.categoryId, categoryId) : undefined
      )
    )
    .orderBy(desc(videos.createdAt))
    .limit(limit);

  if (results.length === 0) return null;

  const items = results.map(row => ({
    title: row.video.title,
    image: row.video.thumbnailUrl || row.speaker?.profileImage || "",
    type: "video" as const,
    link: `/video/${row.video.slug}`
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
