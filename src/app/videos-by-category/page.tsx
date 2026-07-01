import Link from "next/link";
import { db } from "@/lib/db";
import { videoCategories, videos } from "@/db/schema";
import { count, eq, asc, desc, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function VideosByCategoryPage() {
  let cats: any[] = [];
  let countRows: any[] = [];
  let countMap: Record<string, number> = {};

  try {
    cats = await db
      .select({
        id: videoCategories.id,
        name: videoCategories.name,
        slug: videoCategories.slug,
        description: videoCategories.description,
        imageUrl: videoCategories.imageUrl,
      })
      .from(videoCategories)
      .where(isNull(videoCategories.parentId))
      .orderBy(desc(videoCategories.order), asc(videoCategories.name));

    countRows = await db
      .select({ categoryId: videos.categoryId, total: count() })
      .from(videos)
      .where(eq(videos.isPublished, true))
      .groupBy(videos.categoryId);

    countMap = countRows.reduce<Record<string, number>>((acc, row) => {
      if (row.categoryId) acc[row.categoryId] = Number(row.total);
      return acc;
    }, {});
  } catch (error) {
    console.error("Failed to fetch video categories:", error);
  }

  const FALLBACK = [
    { id: "f1", name: "Bayan-ul-Quran", slug: "", description: "Quran commentary video series", imageUrl: null, count: 0 },
    { id: "f2", name: "Khitab-e-Jum'ah", slug: "", description: "Friday sermon videos", imageUrl: null, count: 0 },
    { id: "f3", name: "Zamana Gawah Hai", slug: "", description: "Islamic talk show episodes", imageUrl: null, count: 0 },
    { id: "f4", name: "Ameer Say Mulaqat", slug: "", description: "Meetings with the Ameer", imageUrl: null, count: 0 },
    { id: "f5", name: "Seminars & Conferences", slug: "", description: "Recorded seminar presentations", imageUrl: null, count: 0 },
    { id: "f6", name: "Dars-e-Quran", slug: "", description: "Quran study circles", imageUrl: null, count: 0 },
    { id: "f7", name: "Tazkeer", slug: "", description: "Short reminder videos", imageUrl: null, count: 0 },
    { id: "f8", name: "Policy Statements", slug: "", description: "Organisational policy addresses", imageUrl: null, count: 0 },
  ];

  const display = cats.length > 0
    ? cats.map((c) => ({ ...c, count: countMap[c.id] ?? 0 }))
    : FALLBACK;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {display.map((cat) => {
            const href = cat.slug ? `/videos-by-category/${cat.slug}` : "#";
            return (
              <Link
                key={cat.id}
                href={href}
                className="group flex flex-col items-center bg-transparent transition-all duration-300"
              >
                {/* 16:9 Thumbnail Image */}
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-card border border-border shadow-md group-hover:shadow-xl group-hover:border-primary/40 transition-all duration-500 relative mb-4">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                      <span className="text-muted-foreground/50 text-sm font-medium">No Thumbnail</span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Text Content Below */}
                <div className="text-center w-full px-2">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-foreground-muted mt-2 line-clamp-2 max-w-xs mx-auto">{cat.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
