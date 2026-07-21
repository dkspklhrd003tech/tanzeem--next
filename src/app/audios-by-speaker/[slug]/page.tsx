import { notFound } from "next/navigation";
import { db } from "@/db";
import { speakers, audio } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { AudioListClient } from "@/components/shared/AudioListClient";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let speaker: any = null;
  try {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);
    if (!speaker) {
      speaker = await db.select().from(speakers).where(eq(speakers.slug, `audios-by-speaker/${slug}`)).limit(1).then(res => res[0]);
    }
  } catch (error) {
    console.warn("DB error in generateMetadata:", error);
  }

  if (!speaker) return {};

  return buildMetadata({
    title: speaker.metaTitle || `${speaker.name} Audios`,
    description: speaker.metaDescription || speaker.bio || `Listen to Islamic audio lectures by ${speaker.name}.`,
    path: `/audios-by-speaker/${speaker.slug}`,
    keywords: speaker.metaKeywords ? speaker.metaKeywords.split(",") : ["Islamic audio", speaker.name, "Tanzeem audios"],
  });
}

export default async function SpeakerAudiosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let speaker: any = null;
  let audios: any[] = [];
  try {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);
    if (!speaker) {
      speaker = await db.select().from(speakers).where(eq(speakers.slug, `audios-by-speaker/${slug}`)).limit(1).then(res => res[0]);
    }
    if (speaker) {
      audios = await db
        .select()
        .from(audio)
        .where(eq(audio.speakerId, speaker.id))
        .orderBy(asc(audio.order), desc(audio.createdAt));
    }
  } catch (error) {
    console.warn("DB error in SpeakerAudiosPage:", error);
  }

  if (!speaker) {
    return (
      <main className=" bg-background">
        <div className="container mx-auto py-12">
          <p className="text-center text-muted-foreground">Speaker not found or database is unreachable.</p>
        </div>
      </main>
    );
  }

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Audios By Speaker", path: "/audios-by-speaker" },
    { name: speaker.name, path: `/audios-by-speaker/${speaker.slug}` },
  ];

  const bc = breadcrumbJsonLd(crumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }}
      />

      <main className=" bg-muted/20 py-10">

        {/* Content Section */}
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex justify-center items-center gap-2 text-center flex-wrap">
              Audios by {speaker.name}
              {speaker.bio && (
                <span className="text-foreground font-nastaleeq text-2xl mx-1" dir="rtl">
                  ({speaker.bio})
                </span>
              )}
              <span className="text-sm font-normal !text-primary bg-muted px-3 py-1 rounded-full">
                {audios.length} Audios
              </span>
            </h2>

            <AudioListClient audios={audios} />
          </div>
        </div>
      </main>
    </>
  );
}
