import { notFound } from "next/navigation";
import { db } from "@/db";
import { videoCategories, videos } from "@/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm";
import { SubCategoryClient } from "@/components/videos/SubCategoryClient";

export default async function CategoryVideosPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;

  // 1. Find the Main Category
  const [mainCat] = await db
    .select()
    .from(videoCategories)
    .where(eq(videoCategories.slug, categorySlug))
    .limit(1);

  if (!mainCat) {
    return notFound();
  }

  // 2. Fetch all Sub-Categories of this Main Category
  const subCats = await db
    .select()
    .from(videoCategories)
    .where(and(eq(videoCategories.parentId, mainCat.id), eq(videoCategories.isActive, true)))
    .orderBy(asc(videoCategories.order), asc(videoCategories.name));

  // 3. Fetch all Videos for these sub-categories
  const subCatIds = subCats.map((s) => s.id);

  let allVideos: any[] = [];
  if (subCatIds.length > 0) {
    allVideos = await db
      .select({
        id: videos.slug,
        title: videos.title,
        description: videos.description,
        videoUrl: videos.videoUrl,
        embedUrl: videos.embedUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
        categoryId: videos.categoryId,
      })
      .from(videos)
      .where(and(inArray(videos.categoryId, subCatIds), eq(videos.isPublished, true)))
      .orderBy(asc(videos.order), asc(videos.title));
  }

  // Build the hierarchical structure
  const subCategoriesWithVideos = subCats.map((sub) => {
    return {
      id: sub.id,
      slug: sub.slug,
      name: sub.name,
      description: sub.description,
      imageUrl: sub.imageUrl,
      videos: allVideos.filter((v) => v.categoryId === sub.id),
    };
  });

  let directVideos: any[] = [];

  // Only fetch direct videos if we are inside a sub-category
  if (mainCat.parentId !== null) {
    directVideos = await db
      .select({
        id: videos.slug,
        title: videos.title,
        description: videos.description,
        videoUrl: videos.videoUrl,
        embedUrl: videos.embedUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      })
      .from(videos)
      .where(and(eq(videos.categoryId, mainCat.id), eq(videos.isPublished, true)))
      .orderBy(asc(videos.order), asc(videos.title));
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10 md:py-16">
        {subCategoriesWithVideos.length === 0 && directVideos.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl">
            <p className="text-foreground-muted">No content found in this category.</p>
          </div>
        ) : (
          <SubCategoryClient subCategories={subCategoriesWithVideos} directVideos={directVideos} />
        )}
      </div>
    </main>
  );
}
