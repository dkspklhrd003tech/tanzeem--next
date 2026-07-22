import Link from "next/link";
import { db } from "@/db";
import { speakers, videos } from "@/db/schema";
import { eq, and, asc, count } from "drizzle-orm";
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
      .where(eq(speakers.type, "video"))
      .orderBy(asc(speakers.order), asc(speakers.name));

    if (speakerRows.length === 0) {
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
    }

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

  const display = speakerRows.map((s) => ({ ...s, count: countMap[s.id] ?? 0 }));

  return (
    <main className=" bg-muted/20 py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
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
                className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col group"
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
                <div className="p-4 flex flex-col items-center justify-center gap-3 bg-card hover:bg-primary-light">
                  <h2 className="text-[16px] font-medium text-foreground hover:text-primary text-center line-clamp-1">
                    {sp.name}
                  </h2>
                  {sp.bio && (
                    <p className="text-xl text-foreground hover:text-primary text-center line-clamp-1 font-nastaleeq" dir="rtl">
                      {sp.bio}
                    </p>
                  )}
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {sp.count} Videos
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
