import { db } from "@/db";
import { videoCategories, videos } from "@/db/schema";
import { count, eq, asc } from "drizzle-orm";
import { CategoryGridClient } from "@/components/videos/CategoryGridClient";

export const dynamic = "force-dynamic";

export default async function VideosByCategoryPage() {
  let cats: any[] = [];
  let allCats: any[] = [];
  let countRows: any[] = [];
  let countMap: Record<string, number> = {};

  try {
    allCats = await db
      .select({
        id: videoCategories.id,
        parentId: videoCategories.parentId,
        name: videoCategories.name,
        slug: videoCategories.slug,
        description: videoCategories.description,
        imageUrl: videoCategories.imageUrl,
        customFields: videoCategories.customFields,
      })
      .from(videoCategories)
      .orderBy(asc(videoCategories.order), asc(videoCategories.name));

    cats = allCats.filter(c => !c.parentId);

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
        <CategoryGridClient categories={display} />
      </div>
    </main>
  );
}
