import { notFound } from "next/navigation";
import { db } from "@/db";
import { audioCategories, audio } from "@/db/schema";
import { eq, asc, and, inArray, desc } from "drizzle-orm";
import Link from "next/link";
import { Headphones, AudioLines, Calendar } from "lucide-react";
import { resolveCategoryHref } from "@/lib/utils";

import { AudioSubCategoryClient } from "@/components/audio/AudioSubCategoryClient";

export default async function CategoryAudiosPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;

  // 1. Find the Main Category
  const [mainCat] = await db
    .select()
    .from(audioCategories)
    .where(eq(audioCategories.slug, categorySlug))
    .limit(1);

  if (!mainCat) {
    return notFound();
  }

  // 2. Fetch all Sub-Categories of this Main Category
  const subCats = await db
    .select()
    .from(audioCategories)
    .where(and(eq(audioCategories.parentId, mainCat.id), eq(audioCategories.isActive, true)))
    .orderBy(asc(audioCategories.order), asc(audioCategories.name));

  // 3. Fetch all Audios for these sub-categories
  const subCatIds = subCats.map((s) => s.id);

  let allAudios: any[] = [];
  if (subCatIds.length > 0) {
    allAudios = await db
      .select({
        id: audio.id,
        slug: audio.slug,
        title: audio.title,
        description: audio.description,
        audioUrl: audio.audioUrl,
        thumbnailUrl: audio.thumbnailUrl,
        duration: audio.duration,
        categoryId: audio.categoryId,
        order: audio.order,
      })
      .from(audio)
      .where(and(inArray(audio.categoryId, subCatIds), eq(audio.isPublished, true)))
      .orderBy(asc(audio.order), desc(audio.publishedAt), asc(audio.title));
  }

  // Build the hierarchical structure
  const subCategoriesWithAudios = subCats.map((sub) => {
    return {
      id: sub.id,
      slug: sub.slug,
      name: sub.name,
      code: sub.code,
      order: sub.order,
      description: sub.description,
      imageUrl: sub.imageUrl,
      customFields: sub.customFields as any,
      audios: allAudios.filter((a) => a.categoryId === sub.id),
    };
  });

  let directAudios: any[] = [];

  // Fetch direct audios in this category
  directAudios = await db
    .select({
      id: audio.id,
      slug: audio.slug,
      title: audio.title,
      description: audio.description,
      audioUrl: audio.audioUrl,
      thumbnailUrl: audio.thumbnailUrl,
      duration: audio.duration,
      createdAt: audio.createdAt,
      order: audio.order,
    })
    .from(audio)
    .where(and(eq(audio.categoryId, mainCat.id), eq(audio.isPublished, true)))
    .orderBy(asc(audio.order), desc(audio.publishedAt), asc(audio.title));

  return (
    <main className="bg-background">
      <div className="container mx-auto py-10 md:py-8 max-w-7xl">
        {subCategoriesWithAudios.length === 0 && directAudios.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl">
            <p className="text-foreground">No Audios Found In This Category.</p>
          </div>
        ) : (
          <AudioSubCategoryClient
            subCategories={subCategoriesWithAudios}
            directAudios={directAudios}
          />
        )}
      </div>
    </main>
  );
}
