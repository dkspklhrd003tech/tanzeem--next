import Link from "next/link";
import { db } from "@/lib/db";
import { speakers, audio } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export const metadata = buildMetadata({
  title: "Audios by Speakers",
  description: "Browse Islamic audio lectures organized by speakers.",
  path: "/audios-by-speaker",
  keywords: ["Islamic speakers", "audio lectures", "Tanzeem speakers"],
});

export default async function AudiosBySpeakersPage() {
  const speakerRows = await db
    .select({
      id: speakers.id,
      name: speakers.name,
      slug: speakers.slug,
      bio: speakers.bio,
      imageUrl: speakers.avatar,
    })
    .from(speakers)
    .orderBy(asc(speakers.name));

  const countRows = await db
    .select({ speakerId: audio.speakerId, total: count() })
    .from(audio)
    .where(eq(audio.isPublished, true))
    .groupBy(audio.speakerId);

  const countMap = countRows.reduce<Record<string, number>>((acc, r) => {
    if (r.speakerId) acc[r.speakerId] = Number(r.total);
    return acc;
  }, {});

  const FALLBACK = [
    { id: "s1", name: "Dr. Israr Ahmed", slug: "dr-israr-ahmed", bio: "Founder of Tanzeem-e-Islami", count: 0 },
    { id: "s2", name: "Mohtaram Shujauddin Shaikh", slug: "shujauddin-shaikh", bio: "Current Ameer of Tanzeem-e-Islami", count: 0 },
  ];

  const display = speakerRows.length > 0
    ? speakerRows.map((s) => ({ ...s, count: countMap[s.id] ?? 0 }))
    : FALLBACK;

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {display.map((sp) => {
            // Note: If slug contains the full path "audios-by-speaker/...", we just use it directly, else prepend
            let href = sp.slug;
            if (!href?.startsWith("audios-by-speaker")) {
              href = `/audios-by-speaker/${sp.slug}`;
            } else {
              href = `/${sp.slug}`;
            }
            if (!sp.slug) href = "/audios";

            return (
              <Link
                key={sp.id}
                href={href}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:border-primary/40 hover:shadow-primary/50 transition-all duration-300 flex flex-col group"
              >
                <div className="aspect-[1/1] bg-[#f0f4f8] relative overflow-hidden flex items-end justify-center">
                  {sp.imageUrl ? (
                    <img
                      src={sp.imageUrl}
                      alt={sp.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary text-4xl font-bold">
                      {sp.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center bg-card">
                  <h2 className="text-[17px] font-medium text-foreground text-center line-clamp-1">
                    {sp.name}
                    <span className="text-sm font-normal text-primary bg-muted px-3 py-1 rounded-full">
                      {sp.count} Audios
                    </span>
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
