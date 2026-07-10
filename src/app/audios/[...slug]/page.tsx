import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { audio, customFieldDefinitions } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { AudioPlayerPage } from "@/components/resources/AudioPlayerPage";
import { buildMetadata, audioJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");
  const item = await db.query.audio.findFirst({
    where: and(eq(audio.slug, slug), eq(audio.isPublished, true)),
    with: { speaker: true, category: true },
  });
  if (!item) return { title: "Audio Not Found" };
  return buildMetadata({
    title: item.metaTitle ?? item.title,
    description: item.metaDescription ?? item.description ?? undefined,
    path: `/audios/${slug}`,
    ogImage: item.thumbnailUrl,
    keywords: ["Islamic audio", "lecture", item.speaker?.name ?? "", item.category?.name ?? ""].filter(Boolean),
  });
}

export default async function AudioDetailPage({ params }: Props) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");

  const rawItem = await db.query.audio.findFirst({
    where: and(eq(audio.slug, slug), eq(audio.isPublished, true)),
    with: { category: true, speaker: true },
  });

  if (!rawItem) notFound();

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
  const related = await db.query.audio.findMany({
    where: and(
      eq(audio.isPublished, true),
      ne(audio.id, item.id),
      item.categoryId ? eq(audio.categoryId, item.categoryId) : undefined
    ),
    with: { category: true, speaker: true },
    orderBy: [desc(audio.createdAt)],
    limit: 6,
  });

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
    { name: "Audios", path: "/audios" },
    { name: item.title, path: `/audios/${item.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-background">
      <script id="jsonld-audio" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script id="jsonld-audio-bc" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }} />
      <AudioPlayerPage item={item} related={related} customFieldSchema={customFieldSchema} />
    </main>
  );
}
