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
  // Fetch all published categories that have at least one book
  const cats = await db
    .select({
      id: bookCategories.id,
      name: bookCategories.name,
      slug: bookCategories.slug,
      description: bookCategories.description,
    })
    .from(bookCategories)
    .orderBy(asc(bookCategories.name));

  // Count books per category
  const countRows = await db
    .select({ categoryId: books.categoryId, total: count() })
    .from(books)
    .where(eq(books.isPublished, true))
    .groupBy(books.categoryId);

  const countMap = countRows.reduce<Record<string, number>>((acc, r) => {
    if (r.categoryId) acc[r.categoryId] = Number(r.total);
    return acc;
  }, {});

  // Fallback static categories shown when DB has no categories yet
  const FALLBACK = [
    { id: "f1", name: "Tafseer & Quranic Studies", slug: "", description: "Books on Quranic commentary and sciences", count: 0 },
    { id: "f2", name: "Hadith & Sunnah", slug: "", description: "Collections and explanations of Hadith", count: 0 },
    { id: "f3", name: "Islamic Theology (Aqeedah)", slug: "", description: "Books on Islamic beliefs and creed", count: 0 },
    { id: "f4", name: "Seerah & Islamic History", slug: "", description: "Biography of Prophet (SAW) and Islamic history", count: 0 },
    { id: "f5", name: "Contemporary Issues", slug: "", description: "Islamic perspectives on modern challenges", count: 0 },
    { id: "f6", name: "Spirituality & Tazkiyah", slug: "", description: "Books on spiritual purification", count: 0 },
    { id: "f7", name: "Fiqh & Islamic Law", slug: "", description: "Islamic jurisprudence", count: 0 },
    { id: "f8", name: "Children's Literature", slug: "", description: "Islamic books for young readers", count: 0 },
  ];

  const display = cats.length > 0
    ? cats.map((c) => ({ ...c, count: countMap[c.id] ?? 0 }))
    : FALLBACK;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        <p className="section-label mb-2">Our Books</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Books by Category</h1>
        <p className="text-lg text-foreground-muted mb-10 max-w-2xl">
          Explore books organised by subject area for easy discovery.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl">
          {display.map((cat) => {
            const href = cat.slug ? `/books?category=${cat.slug}` : "/books";
            return (
              <Link
                key={cat.id}
                href={href}
                className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-mid hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors leading-snug">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-foreground-muted mb-3 line-clamp-2">{cat.description}</p>
                )}
                {cat.count > 0 && (
                  <span className="text-xs text-primary font-medium">{cat.count} book{cat.count !== 1 ? "s" : ""}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA to full books listing */}
        <div className="mt-10">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Browse All Books →
          </Link>
        </div>
      </div>
    </main>
  );
}
