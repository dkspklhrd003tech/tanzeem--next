import { notFound } from "next/navigation";
import { db } from "@/db";
import { speakers, videos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { VideoListClient } from "@/components/shared/VideoListClient";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);

  if (!speaker) {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, `videos-by-speakers/${slug}`)).limit(1).then(res => res[0]);
  }

  if (!speaker) return {};

  return buildMetadata({
    title: speaker.metaTitle || `${speaker.name} Videos`,
    description: speaker.metaDescription || speaker.bio || `Watch Islamic video lectures by ${speaker.name}.`,
    path: `/videos-by-speakers/${speaker.slug}`,
    keywords: speaker.metaKeywords ? speaker.metaKeywords.split(",") : ["Islamic videos", speaker.name, "Tanzeem videos"],
  });
}

export default async function SpeakerVideosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);

  if (!speaker) {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, `videos-by-speakers/${slug}`)).limit(1).then(res => res[0]);
  }

  if (!speaker) {
    notFound();
  }

  const vids = await db
    .select()
    .from(videos)
    .where(eq(videos.speakerId, speaker.id))
    .orderBy(desc(videos.createdAt));

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Videos By Speaker", path: "/videos-by-speakers" },
    { name: speaker.name, path: `/videos-by-speakers/${speaker.slug}` },
  ];

  const bc = breadcrumbJsonLd(crumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }}
      />

      <main className="min-h-screen bg-muted/20 py-10">

        {/* Content Section */}
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-4 md:p-6">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                Videos by {speaker.name}
              </h2>

              <VideoListClient vids={vids} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
