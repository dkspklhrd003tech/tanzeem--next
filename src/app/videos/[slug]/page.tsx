import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { videos } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { VideoDetailPage } from "@/components/resources/VideoDetailPage";
import { buildMetadata, videoJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await db.query.videos.findFirst({
    where: and(eq(videos.slug, slug), eq(videos.isPublished, true)),
    with: { speaker: true, category: true },
  });
  if (!item) return { title: "Video Not Found" };
  return buildMetadata({
    title: item.metaTitle ?? item.title,
    description: item.metaDescription ?? item.description ?? undefined,
    path: `/videos/${slug}`,
    ogImage: item.thumbnailUrl,
    keywords: ["Islamic video", "lecture", item.speaker?.name ?? "", item.category?.name ?? ""].filter(Boolean),
  });
}

export default async function VideoDetailRoute({ params }: Props) {
  const { slug } = await params;

  const item = await db.query.videos.findFirst({
    where: and(eq(videos.slug, slug), eq(videos.isPublished, true)),
    with: { category: true, speaker: true },
  });
  if (!item) notFound();

  const related = await db.query.videos.findMany({
    where: and(
      eq(videos.isPublished, true),
      ne(videos.id, item.id),
      item.categoryId ? eq(videos.categoryId, item.categoryId) : undefined
    ),
    with: { category: true, speaker: true },
    orderBy: [desc(videos.createdAt)],
    limit: 6,
  });

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
      <VideoDetailPage item={item} related={related} />
    </main>
  );
}
