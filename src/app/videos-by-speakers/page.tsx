import Link from "next/link";
import { db } from "@/lib/db";
import { speakers, videos } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export const metadata = buildMetadata({
  title: "Videos by Speakers",
  description: "Browse Islamic video lectures organized by speakers, including Dr. Israr Ahmed and Shujauddin Sheikh.",
  path: "/videos-by-speakers",
  keywords: ["Islamic speakers", "Dr Israr Ahmed lectures", "Shujauddin Sheikh videos", "Tanzeem speakers"],
});

export default async function VideosBySpeakersPage() {
  let speakerRows: any[] = [];
  let countMap: Record<string, number> = {};

  try {
    speakerRows = await db
      .select({
        id: speakers.id,
        name: speakers.name,
        slug: speakers.slug,
        bio: speakers.bio,
        imageUrl: speakers.avatar,
      })
      .from(speakers)
      .orderBy(asc(speakers.order), asc(speakers.name));

    const countRows = await db
      .select({ speakerId: videos.speakerId, total: count() })
      .from(videos)
      .where(eq(videos.isPublished, true))
      .groupBy(videos.speakerId);

    countMap = countRows.reduce<Record<string, number>>((acc, r) => {
      if (r.speakerId) acc[r.speakerId] = Number(r.total);
      return acc;
    }, {});
  } catch (error) {
    console.warn("Could not fetch videos from DB during build. Using fallback.");
  }

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
            let href = sp.slug;
            if (!href?.startsWith("videos-by-speakers")) {
              href = `/videos-by-speakers/${sp.slug}`;
            } else {
              href = `/${sp.slug}`;
            }
            if (!sp.slug) href = "/videos";
            return (
              <Link
                key={sp.id}
                href={href}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col group"
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
                      {sp.count} Videos
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
