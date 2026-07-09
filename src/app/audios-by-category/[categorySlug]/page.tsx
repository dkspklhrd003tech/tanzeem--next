import { notFound } from "next/navigation";
import { db } from "@/db";
import { audioCategories, audio } from "@/db/schema";
import { eq, asc, and, inArray, desc } from "drizzle-orm";
import Link from "next/link";
import { Headphones, PlayCircle } from "lucide-react";

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
        id: audio.slug,
        title: audio.title,
        description: audio.description,
        audioUrl: audio.audioUrl,
        thumbnailUrl: audio.thumbnailUrl,
        duration: audio.duration,
        categoryId: audio.categoryId,
      })
      .from(audio)
      .where(and(inArray(audio.categoryId, subCatIds), eq(audio.isPublished, true)))
      .orderBy(desc(audio.publishedAt), asc(audio.title));
  }

  // Build the hierarchical structure
  const subCategoriesWithAudios = subCats.map((sub) => {
    return {
      id: sub.id,
      slug: sub.slug,
      name: sub.name,
      description: sub.description,
      imageUrl: sub.imageUrl,
      audios: allAudios.filter((a) => a.categoryId === sub.id),
    };
  });

  let directAudios: any[] = [];

  // Fetch direct audios in this category
  directAudios = await db
    .select({
      id: audio.slug,
      title: audio.title,
      description: audio.description,
      audioUrl: audio.audioUrl,
      thumbnailUrl: audio.thumbnailUrl,
      duration: audio.duration,
    })
    .from(audio)
    .where(and(eq(audio.categoryId, mainCat.id), eq(audio.isPublished, true)))
    .orderBy(desc(audio.publishedAt), asc(audio.title));

  function formatDuration(secs: number | null) {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10 md:py-16 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground text-center">{mainCat.name}</h1>

        {subCategoriesWithAudios.length === 0 && directAudios.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl">
            <p className="text-foreground-muted">No audios found in this category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Direct Audios */}
            {directAudios.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {directAudios.map((item) => (
                  <Link
                    href={`/audio/${item.id}`}
                    key={item.id}
                    className="group text-left bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden flex flex-col block w-full"
                  >
                    <div className="w-full aspect-square bg-muted relative overflow-hidden">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Headphones className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                      </div>
                      {item.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-foreground-muted mt-2 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Sub Categories */}
            {subCategoriesWithAudios.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {subCategoriesWithAudios.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      className="group flex flex-col items-center bg-transparent transition-all duration-300 text-left outline-none opacity-100"
                    >
                      <Link
                        href={`/audios-by-category/${sub.slug}`}
                        className="w-full aspect-square rounded-xl overflow-hidden bg-card border shadow-md group-hover:shadow-xl border-border group-hover:border-primary/40 transition-all duration-500 relative mb-4 block"
                      >
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Headphones className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                      </Link>

                      <Link href={`/audios-by-category/${sub.slug}`} className="text-center w-full px-2 hover:opacity-80 transition-opacity">
                        <h3 className="text-lg md:text-xl font-semibold transition-colors duration-300 text-foreground group-hover:text-primary">
                          {sub.name}
                        </h3>
                        {sub.description && (
                          <p className="text-sm text-foreground-muted mt-2 line-clamp-2 max-w-xs mx-auto">{sub.description}</p>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
