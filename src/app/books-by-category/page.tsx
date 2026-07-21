import Link from "next/link";
import { db } from "@/db";
import { bookCategories, books } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export const metadata = buildMetadata({
  title: "Books by Category",
  description: "Browse Tanzeem-e-Islami's Islamic book collection organised by subject — Quran, Hadith, Seerah, Aqeedah, Fiqh, and more.",
  path: "/books-by-category",
  keywords: ["Islamic books by category", "Tanzeem books", "Quran books", "Islamic education"],
});

export default async function BooksByCategoryPage() {
  let cats: any[] = [];
  let countMap: Record<string, number> = {};

  try {
    cats = await db
      .select({
        id: bookCategories.id,
        name: bookCategories.name,
        slug: bookCategories.slug,
        description: bookCategories.description,
        coverImage: bookCategories.coverImage,
        urduName: bookCategories.urduName,
      })
      .from(bookCategories)
      .orderBy(asc(bookCategories.order), asc(bookCategories.name));

    const countRows = await db
      .select({ categoryId: books.categoryId, total: count() })
      .from(books)
      .where(eq(books.isPublished, true))
      .groupBy(books.categoryId);

    countMap = countRows.reduce<Record<string, number>>((acc, r) => {
      if (r.categoryId) acc[r.categoryId] = Number(r.total);
      return acc;
    }, {});
  } catch (error) {
    console.warn("Could not fetch book categories from DB during build. Using fallback.");
  }

  const display = cats.map((c) => ({ ...c, count: countMap[c.id] ?? 0 }));

  return (
    <main className=" bg-background">
      <div className="container mx-auto py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {display.map((cat) => {
            const isExternal = cat.slug.startsWith('http') || cat.slug.startsWith('/');
            const href = isExternal ? cat.slug : `/books-by-category/${cat.slug}`;
            return (
              <Link
                key={cat.id}
                href={href}
                target={cat.slug.startsWith('http') ? '_blank' : undefined}
                className="group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl border border-border transition-all bg-card mb-4">
                  {cat.coverImage ? (
                    <img src={cat.coverImage} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground font-semibold text-lg">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug flex items-center justify-center gap-2 flex-wrap">
                  <span>{cat.name}</span> -
                  {cat.urduName && (
                    <span className="font-nastaleeq text-xl" dir="rtl">
                      {cat.urduName}
                    </span>
                  )}
                </h3>
                {cat.count > 0 && (
                  <span className="text-sm text-primary border rounded-full px-3 py-1 border-primary bg-primary-light/80 font-medium mt-1">{cat.count} Book{cat.count !== 1 ? "s" : ""}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
