import { notFound } from "next/navigation";
import { db } from "@/db";
import { audioCategories, audio } from "@/db/schema";
import { eq, asc, and, inArray, desc } from "drizzle-orm";
import Link from "next/link";
import { Headphones, AudioLines, Calendar } from "lucide-react";

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
      id: audio.id,
      slug: audio.slug,
      title: audio.title,
      description: audio.description,
      audioUrl: audio.audioUrl,
      thumbnailUrl: audio.thumbnailUrl,
      duration: audio.duration,
      createdAt: audio.createdAt,
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
    <main className=" bg-background">
      <div className="container mx-auto py-10 md:py-8 max-w-7xl">

        {subCategoriesWithAudios.length === 0 && directAudios.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl">
            <p className="text-foreground-muted">No audios found in this category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Direct Audios */}
            {directAudios.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {directAudios.map((item) => {
                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).toUpperCase()
                    : "RECENT";

                  return (
                    <Link
                      href={`/audio/${item.slug || item.id}`}
                      key={item.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 rounded-xl border border-primary/30 hover:border-border/30 bg-muted/50 hover:bg-primary-light/80 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full"
                    >
                      <div className="flex-1">
                        <div className="flex flex-col items-start gap-1 mb-1">
                          {/* Date Pill */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] sm:text-xs font-bold mb-1 w-fit">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formattedDate}</span>
                          </div>
                          <h3 className="font-bold text-md flex items-center gap-2 group-hover:text-primary transition-colors uppercase leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                        {item.description && (
                          <p className="text-xs text-foreground-muted mt-2 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/10 group-hover:text-primary transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                          <AudioLines className="w-7 h-7" />
                        </button>
                        <span className="text-[11px] text-foreground font-medium transition-opacity hidden md:block">Listen Now</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Sub Categories */}
            {subCategoriesWithAudios.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {subCategoriesWithAudios.map((sub) => {
                  return (
                    <Link
                      key={sub.id}
                      href={`/audios-by-category/${sub.slug}`}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 rounded-xl border border-primary/30 hover:border-border/30 bg-muted/50 hover:bg-primary-light/80 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-md flex items-center gap-2 group-hover:text-primary transition-colors leading-snug line-clamp-2 text-left">
                          {sub.name}
                        </h3>
                        {sub.description && (
                          <p className="text-xs text-foreground-muted mt-2 line-clamp-2 text-left">{sub.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/10 group-hover:text-primary transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                          <AudioLines className="w-7 h-7" />
                        </button>
                        <span className="text-[11px] text-foreground font-medium transition-opacity hidden md:block">
                          {sub.audios.length} Audios
                        </span>
                      </div>
                    </Link>
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
