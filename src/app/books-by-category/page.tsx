import Link from "next/link";
import { db } from "@/lib/db";
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

  // Fallback static categories shown when DB has no categories yet
  const FALLBACK = [
    { id: "f1", name: "Tafseer & Quranic Studies", slug: "tafseer", description: "Books on Quranic commentary and sciences", coverImage: null, count: 0 },
    { id: "f2", name: "Hadith & Sunnah", slug: "hadith", description: "Collections and explanations of Hadith", coverImage: null, count: 0 },
    { id: "f3", name: "Islamic Theology (Aqeedah)", slug: "aqeedah", description: "Books on Islamic beliefs and creed", coverImage: null, count: 0 },
    { id: "f4", name: "Seerah & Islamic History", slug: "seerah", description: "Biography of Prophet (SAW) and Islamic history", coverImage: null, count: 0 },
    { id: "f5", name: "Contemporary Issues", slug: "contemporary", description: "Islamic perspectives on modern challenges", coverImage: null, count: 0 },
    { id: "f6", name: "Spirituality & Tazkiyah", slug: "spirituality", description: "Books on spiritual purification", coverImage: null, count: 0 },
    { id: "f7", name: "Fiqh & Islamic Law", slug: "fiqh", description: "Islamic jurisprudence", coverImage: null, count: 0 },
    { id: "f8", name: "Children's Literature", slug: "children", description: "Islamic books for young readers", coverImage: null, count: 0 },
  ];

  const display = cats.length > 0
    ? cats.map((c) => ({ ...c, count: countMap[c.id] ?? 0 }))
    : FALLBACK;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <p className="text-lg text-foreground-muted mb-6 max-w-2xl">
          Explore books organised by subject area for easy discovery.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl">
          {display.map((cat) => {
            const href = `/books-by-category/${cat.slug}`;
            return (
              <Link
                key={cat.id}
                href={href}
                className="group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl border border-border transition-all bg-card mb-4">
                  {cat.coverImage ? (
                    <img src={cat.coverImage} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground font-semibold text-lg">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {cat.name}
                </h3>
                {cat.count > 0 && (
                  <span className="text-sm text-muted-foreground font-medium mt-1">{cat.count} book{cat.count !== 1 ? "s" : ""}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
