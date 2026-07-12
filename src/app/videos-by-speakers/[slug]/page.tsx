import { notFound } from "next/navigation";
import { db } from "@/db";
import { speakers, videos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { VideoListClient } from "@/components/shared/VideoListClient";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let speaker: any = null;
  try {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);
    if (!speaker) {
      speaker = await db.select().from(speakers).where(eq(speakers.slug, `videos-by-speakers/${slug}`)).limit(1).then(res => res[0]);
    }
  } catch (error) {
    console.warn("DB error in generateMetadata:", error);
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

  let speaker: any = null;
  let vids: any[] = [];
  try {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);
    if (!speaker) {
      speaker = await db.select().from(speakers).where(eq(speakers.slug, `videos-by-speakers/${slug}`)).limit(1).then(res => res[0]);
    }
    if (speaker) {
      vids = await db
        .select()
        .from(videos)
        .where(eq(videos.speakerId, speaker.id))
        .orderBy(desc(videos.createdAt));
    }
  } catch (error) {
    console.warn("DB error in SpeakerVideosPage:", error);
  }

  if (!speaker) {
    // If DB is unreachable or speaker doesn't exist, we can't show videos.
    // Instead of throwing a 404, we just render an empty state so the build doesn't crash.
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-12">
          <p className="text-center text-muted-foreground">Speaker not found or database is unreachable.</p>
        </div>
      </main>
    );
  }

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
            <h2 className="text-2xl font-bold mb-8 flex justify-center items-center gap-2 text-center flex-wrap">
              Videos by {speaker.name}
              {speaker.bio && (
                <span className="text-foreground font-nastaleeq text-2xl mx-1" dir="rtl">
                  ({speaker.bio})
                </span>
              )}
              <span className="text-sm font-normal text-primary bg-muted px-3 py-1 rounded-full">
                {vids.length} Videos
              </span>
            </h2>

            <VideoListClient vids={vids} />
          </div>
        </div>
      </main>
    </>
  );
}
