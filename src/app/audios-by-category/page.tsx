import Link from "next/link";
import { AudioLines } from "lucide-react";
import { db } from "@/db";
import { audioCategories, audio } from "@/db/schema";
import { count, eq, asc, desc, isNull } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Audios by Category",
  description: "Browse Islamic audio lectures organized by categories.",
  path: "/audios-by-category",
  keywords: ["Islamic audio", "audio lectures", "Tanzeem audio categories"],
});

export default async function AudiosByCategoryPage() {
  let cats: any[] = [];
  let countRows: any[] = [];
  let countMap: Record<string, number> = {};

  try {
    cats = await db
      .select({
        id: audioCategories.id,
        name: audioCategories.name,
        slug: audioCategories.slug,
        description: audioCategories.description,
        imageUrl: audioCategories.imageUrl,
        customFields: audioCategories.customFields,
      })
      .from(audioCategories)
      .where(isNull(audioCategories.parentId))
      .orderBy(desc(audioCategories.order), asc(audioCategories.name));

    countRows = await db
      .select({ categoryId: audio.categoryId, total: count() })
      .from(audio)
      .where(eq(audio.isPublished, true))
      .groupBy(audio.categoryId);

    countMap = countRows.reduce<Record<string, number>>((acc, row) => {
      if (row.categoryId) acc[row.categoryId] = Number(row.total);
      return acc;
    }, {});
  } catch (error) {
    console.error("Failed to fetch audio categories:", error);
  }

  const display = cats.map((c) => ({ ...c, count: countMap[c.id] ?? 0 }));

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {display.map((cat) => {
            const href = cat.slug ? `/audios-by-category/${cat.slug}` : "#";
            return (
              <Link
                key={cat.id}
                href={href}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-primary-light/80 hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {cat.name}
                  </h3>
                  {cat.customFields?.urduName && (
                    <p className="text-sm text-muted-foreground mt-1" dir="rtl">{cat.customFields.urduName}</p>
                  )}
                  {cat.description && (
                    <p className="text-xs text-foreground-muted mt-2 line-clamp-2">{cat.description}</p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                  <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                    <AudioLines className="w-7 h-7" />
                  </button>
                  <span className="text-[11px] text-foreground font-medium transition-opacity hidden md:block">
                    {cat.count} Audios
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
