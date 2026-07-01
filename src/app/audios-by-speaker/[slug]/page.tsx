import { notFound } from "next/navigation";
import { db } from "@/db";
import { speakers, audio } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { AudioListClient } from "@/components/shared/AudioListClient";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);

  if (!speaker) {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, `audios-by-speaker/${slug}`)).limit(1).then(res => res[0]);
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

  let speaker = await db.select().from(speakers).where(eq(speakers.slug, slug)).limit(1).then(res => res[0]);

  if (!speaker) {
    speaker = await db.select().from(speakers).where(eq(speakers.slug, `audios-by-speaker/${slug}`)).limit(1).then(res => res[0]);
  }

  if (!speaker) {
    notFound();
  }

  const audios = await db
    .select()
    .from(audio)
    .where(eq(audio.speakerId, speaker.id))
    .orderBy(desc(audio.createdAt));

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

      <main className="min-h-screen bg-muted/20 py-10">

        {/* Content Section */}
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-4 md:p-6">
              <h2 className="text-2xl font-bold mb-8 flex justify-center items-center gap-2 text-center">
                Audios by {speaker.name}
                <span className="text-sm font-normal text-primary bg-muted px-3 py-1 rounded-full">
                  {audios.length} Audios
                </span>
              </h2>

              <AudioListClient audios={audios} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
