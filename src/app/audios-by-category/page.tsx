import Link from "next/link";
import { Headphones } from "lucide-react";
import { db } from "@/db";
import { audioCategories, audio } from "@/db/schema";
import { count, eq, asc, desc, isNull } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";
import { resolveCategoryHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Audios by Category",
  description: "Browse Islamic audio lectures organized by categories.",
  path: "/audios-by-category",
  keywords: ["Islamic audio", "audio lectures", "Tanzeem audio categories"],
});

export default async function AudiosByCategoryPage() {
  let cats: any[] = [];
  let allCats: any[] = [];
  let countRows: any[] = [];
  let countMap: Record<string, number> = {};

  try {
    allCats = await db
      .select({
        id: audioCategories.id,
        parentId: audioCategories.parentId,
        name: audioCategories.name,
        slug: audioCategories.slug,
        description: audioCategories.description,
        imageUrl: audioCategories.imageUrl,
        customFields: audioCategories.customFields,
      })
      .from(audioCategories)
      .orderBy(asc(audioCategories.order), asc(audioCategories.name));

    cats = allCats.filter(c => !c.parentId);

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

  const display = cats.map((c) => {
    let total = countMap[c.id] ?? 0;
    const subCatIds = allCats.filter(sub => sub.parentId === c.id).map(sub => sub.id);
    subCatIds.forEach(subId => {
      total += (countMap[subId] ?? 0);
    });
    return { ...c, count: total };
  });

  return (
    <main className=" bg-background">
      <div className="container mx-auto py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {display.map((cat) => {
            const { href, isExternal, openInNewTab: isExtOpen } = resolveCategoryHref(cat.slug, "/audios-by-category");
            const target = (cat.customFields?.openInNewTab || isExtOpen) ? "_blank" : undefined;
            const rel = isExternal ? "noopener noreferrer" : undefined;
            return (
              <Link
                key={cat.id}
                href={href}
                target={target}
                rel={rel}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 rounded-xl border border-primary/30 hover:border-border/30 bg-muted/50 hover:bg-primary-light/80 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-md group-hover:text-primary transition-colors leading-snug text-left">
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
                  <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/10 group-hover:text-primary transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                    <Headphones className="w-7 h-7" />
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
