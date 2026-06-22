import Link from "next/link";
import { db } from "@/lib/db";
import { videoCategories, videos } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export const metadata = buildMetadata({
  title: "Videos by Category",
  description: "Browse Tanzeem-e-Islami Islamic video lectures by category — Bayan-ul-Quran, Khitab-e-Jum'ah, Dars-e-Quran, and more.",
  path: "/videos-by-category",
  keywords: ["Islamic videos by category", "Bayan ul Quran", "Dars-e-Quran videos", "Tanzeem video"],
});

export default async function VideosByCategoryPage() {
  const cats = await db
    .select({
      id: videoCategories.id,
      name: videoCategories.name,
      slug: videoCategories.slug,
      description: videoCategories.description,
    })
    .from(videoCategories)
    .orderBy(asc(videoCategories.name));

  const countRows = await db
    .select({ categoryId: videos.categoryId, total: count() })
    .from(videos)
    .where(eq(videos.isPublished, true))
    .groupBy(videos.categoryId);

  const countMap = countRows.reduce<Record<string, number>>((acc, r) => {
    if (r.categoryId) acc[r.categoryId] = Number(r.total);
    return acc;
  }, {});

  const FALLBACK = [
    { id: "f1", name: "Bayan-ul-Quran", slug: "", description: "Quran commentary video series", count: 0 },
    { id: "f2", name: "Khitab-e-Jum'ah", slug: "", description: "Friday sermon videos", count: 0 },
    { id: "f3", name: "Zamana Gawah Hai", slug: "", description: "Islamic talk show episodes", count: 0 },
    { id: "f4", name: "Ameer Say Mulaqat", slug: "", description: "Meetings with the Ameer", count: 0 },
    { id: "f5", name: "Seminars & Conferences", slug: "", description: "Recorded seminar presentations", count: 0 },
    { id: "f6", name: "Dars-e-Quran", slug: "", description: "Quran study circles", count: 0 },
    { id: "f7", name: "Tazkeer", slug: "", description: "Short reminder videos", count: 0 },
    { id: "f8", name: "Policy Statements", slug: "", description: "Organisational policy addresses", count: 0 },
  ];

  const display = cats.length > 0
    ? cats.map((c) => ({ ...c, count: countMap[c.id] ?? 0 }))
    : FALLBACK;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        <p className="section-label mb-2">Video Library</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Videos by Category</h1>
        <p className="text-lg text-foreground-muted mb-10 max-w-2xl">
          Explore our Islamic video collection organised by category.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl">
          {display.map((cat) => {
            const href = cat.slug ? `/videos?category=${cat.slug}` : "/videos";
            return (
              <Link
                key={cat.id}
                href={href}
                className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-mid hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors leading-snug">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-foreground-muted mb-3 line-clamp-2">{cat.description}</p>
                )}
                {cat.count > 0 && (
                  <span className="text-xs text-primary font-medium">{cat.count} video{cat.count !== 1 ? "s" : ""}</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Browse All Videos →
          </Link>
        </div>
      </div>
    </main>
  );
}
