import Link from "next/link";
import { Headphones } from "lucide-react";
import { db } from "@/db";
import { audioCategories, audio } from "@/db/schema";
import { count, eq, asc, desc, isNull } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";
import { resolveCategoryHref } from "@/lib/utils";

import { AudioCategoryGridClient } from "@/components/audio/AudioCategoryGridClient";

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
        code: audioCategories.code,
        order: audioCategories.order,
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
    <main className="bg-background">
      <div className="container mx-auto py-8 md:py-12">
        <AudioCategoryGridClient categories={display} />
      </div>
    </main>
  );
}
