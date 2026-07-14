import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { audio, customFieldDefinitions, audioCategories, speakers } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { AudioPlayerPage } from "@/components/resources/AudioPlayerPage";
import { buildMetadata, audioJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");
  const [result] = await db
    .select({
      audio: audio,
      category: audioCategories,
      speaker: speakers,
    })
    .from(audio)
    .leftJoin(audioCategories, eq(audio.categoryId, audioCategories.id))
    .leftJoin(speakers, eq(audio.speakerId, speakers.id))
    .where(and(eq(audio.slug, slug), eq(audio.isPublished, true)))
    .limit(1);

  if (!result) return { title: "Audio Not Found" };
  const item = { ...result.audio, category: result.category, speaker: result.speaker };
  return buildMetadata({
    title: item.metaTitle || item.title,
    description: item.metaDescription || item.description || undefined,
    path: `/audio/${slug}`,
    ogImage: item.thumbnailUrl,
    keywords: ["Islamic audio", "lecture", item.speaker?.name ?? "", item.category?.name ?? ""].filter(Boolean),
  });
}

export default async function AudioDetailPage({ params }: Props) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");

  const [result] = await db
    .select({
      audio: audio,
      category: audioCategories,
      speaker: speakers,
    })
    .from(audio)
    .leftJoin(audioCategories, eq(audio.categoryId, audioCategories.id))
    .leftJoin(speakers, eq(audio.speakerId, speakers.id))
    .where(and(eq(audio.slug, slug), eq(audio.isPublished, true)))
    .limit(1);

  if (!result) notFound();
  const rawItem = { ...result.audio, category: result.category, speaker: result.speaker };

  let parsedCustomFields = rawItem.customFields;
  if (typeof rawItem.customFields === "string") {
    try {
      parsedCustomFields = rawItem.customFields ? JSON.parse(rawItem.customFields) : {};
    } catch (e) {
      console.warn("Failed to parse customFields for audio:", slug);
      parsedCustomFields = {};
    }
  }

  const item = {
    ...rawItem,
    customFields: parsedCustomFields
  };

  const customFieldSchema = await db.select().from(customFieldDefinitions).where(eq(customFieldDefinitions.entityType, "audio"));

  // Related lectures — same category or speaker, exclude current
  const relatedQuery = await db
    .select({
      audio: audio,
      category: audioCategories,
      speaker: speakers,
    })
    .from(audio)
    .leftJoin(audioCategories, eq(audio.categoryId, audioCategories.id))
    .leftJoin(speakers, eq(audio.speakerId, speakers.id))
    .where(
      and(
        eq(audio.isPublished, true),
        ne(audio.id, item.id),
        ...(item.categoryId ? [eq(audio.categoryId, item.categoryId)] : [])
      )
    )
    .orderBy(desc(audio.createdAt))
    .limit(6);

  const related = relatedQuery.map((row) => ({
    ...row.audio,
    category: row.category,
    speaker: row.speaker,
  }));

  const ld = audioJsonLd({
    title: item.title,
    description: item.description,
    slug: item.slug,
    audioUrl: item.audioUrl,
    thumbnailUrl: item.thumbnailUrl,
    duration: item.duration,
    speakerName: item.speaker?.name,
    datePublished: item.publishedAt,
  });
  const bc = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Audio", path: "/audio" },
    { name: item.title, path: `/audio/${item.slug}` },
  ]);

  return (
    <main className=" bg-background">
      <script id="jsonld-audio" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script id="jsonld-audio-bc" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }} />
      <AudioPlayerPage item={item} related={related} customFieldSchema={customFieldSchema} />
    </main>
  );
}
