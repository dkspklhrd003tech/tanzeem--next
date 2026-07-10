import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { videos, customFieldDefinitions, videoCategories, speakers } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { VideoDetailPage } from "@/components/resources/VideoDetailPage";
import { buildMetadata, videoJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");
  const [result] = await db
    .select({
      videos: videos,
      category: videoCategories,
      speaker: speakers,
    })
    .from(videos)
    .leftJoin(videoCategories, eq(videos.categoryId, videoCategories.id))
    .leftJoin(speakers, eq(videos.speakerId, speakers.id))
    .where(and(eq(videos.slug, slug), eq(videos.isPublished, true)))
    .limit(1);

  if (!result) return { title: "Video Not Found" };
  const item = { ...result.videos, category: result.category, speaker: result.speaker };
  return buildMetadata({
    title: item.metaTitle ?? item.title,
    description: item.metaDescription ?? item.description ?? undefined,
    path: `/videos/${slug}`,
    ogImage: item.thumbnailUrl,
    keywords: ["Islamic video", "lecture", item.speaker?.name ?? "", item.category?.name ?? ""].filter(Boolean),
  });
}

export default async function VideoDetailRoute({ params }: Props) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");

  const [result] = await db
    .select({
      videos: videos,
      category: videoCategories,
      speaker: speakers,
    })
    .from(videos)
    .leftJoin(videoCategories, eq(videos.categoryId, videoCategories.id))
    .leftJoin(speakers, eq(videos.speakerId, speakers.id))
    .where(and(eq(videos.slug, slug), eq(videos.isPublished, true)))
    .limit(1);

  if (!result) notFound();
  const rawItem = { ...result.videos, category: result.category, speaker: result.speaker };
  
  let parsedCustomFields = rawItem.customFields;
  if (typeof rawItem.customFields === "string") {
    try {
      parsedCustomFields = rawItem.customFields ? JSON.parse(rawItem.customFields) : {};
    } catch (e) {
      console.warn("Failed to parse customFields for video:", slug);
      parsedCustomFields = {};
    }
  }

  const item = {
    ...rawItem,
    customFields: parsedCustomFields
  };

  const customFieldSchema = await db.select().from(customFieldDefinitions).where(eq(customFieldDefinitions.entityType, "video"));

  const relatedQuery = await db
    .select({
      videos: videos,
      category: videoCategories,
      speaker: speakers,
    })
    .from(videos)
    .leftJoin(videoCategories, eq(videos.categoryId, videoCategories.id))
    .leftJoin(speakers, eq(videos.speakerId, speakers.id))
    .where(
      and(
        eq(videos.isPublished, true),
        ne(videos.id, item.id),
        item.categoryId ? eq(videos.categoryId, item.categoryId) : undefined
      )
    )
    .orderBy(desc(videos.createdAt))
    .limit(6);

  const related = relatedQuery.map((row) => ({
    ...row.videos,
    category: row.category,
    speaker: row.speaker,
  }));

  const ld = videoJsonLd({
    title: item.title,
    description: item.description,
    slug: item.slug,
    videoUrl: item.videoUrl,
    thumbnailUrl: item.thumbnailUrl,
    duration: item.duration,
    speakerName: item.speaker?.name,
    datePublished: item.publishedAt,
  });
  const bc = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Videos", path: "/videos" },
    { name: item.title, path: `/videos/${item.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-background">
      <script id="jsonld-video" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script id="jsonld-video-bc" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }} />
      <VideoDetailPage item={item} related={related} customFieldSchema={customFieldSchema} />
    </main>
  );
}
