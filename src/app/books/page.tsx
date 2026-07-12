import { Suspense } from "react";
import { Metadata } from "next";
import { db } from "@/db";
import { books, bookCategories } from "@/db/schema";
import { eq, desc, asc, and, like, or, count } from "drizzle-orm";
import { BooksListing } from "@/components/resources/BooksListing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Books | Tanzeem-e-Islami",
  description:
    "Download and read Islamic books by Dr. Israr Ahmed and Tanzeem-e-Islami scholars covering Quran, Hadith, Islamic thought, and more.",
  keywords: ["Islamic books", "Dr. Israr Ahmed books", "Tanzeem books", "free Islamic PDFs"],
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; language?: string; q?: string; page?: string }>;
}) {
  const sp       = await searchParams;
  const catSlug  = sp.category ?? "";
  const lang     = sp.language ?? "";
  const q        = sp.q        ?? "";
  const pageNum  = Math.max(1, parseInt(sp.page ?? "1"));
  const PER_PAGE = 24;

  const cats = await db.select({
    id: bookCategories.id,
    name: bookCategories.name,
    slug: bookCategories.slug,
    bookCount: count(books.id),
  })
  .from(bookCategories)
  .leftJoin(books, and(eq(books.categoryId, bookCategories.id), eq(books.isPublished, true)))
  .groupBy(bookCategories.id)
  .orderBy(asc(bookCategories.name));

  const activeCatId = catSlug ? (cats.find((c) => c.slug === catSlug)?.id ?? null) : null;

  const conditions: any[] = [eq(books.isPublished, true)];
  if (activeCatId) conditions.push(eq(books.categoryId, activeCatId));
  if (lang)        conditions.push(eq(books.language, lang));
  if (q.trim())    conditions.push(or(like(books.title, `%${q.trim()}%`), like(books.description, `%${q.trim()}%`), like(books.authorName, `%${q.trim()}%`)));

  const where  = and(...conditions);
  const offset = (pageNum - 1) * PER_PAGE;

  const [rows, totalResult] = await Promise.all([
    db.query.books.findMany({
      where,
      with: { category: true },
      orderBy: [asc(books.order), desc(books.createdAt)],
      limit: PER_PAGE,
      offset,
    }),
    db.select({ total: count() }).from(books).where(where),
  ]);

  const total      = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="min-h-screen bg-background">
      <Suspense>
        <BooksListing
          items={rows}
          categories={cats}
          activeCategorySlug={catSlug}
          activeLanguage={lang}
          searchQuery={q}
          page={pageNum}
          totalPages={totalPages}
          total={total}
        />
      </Suspense>
    </main>
  );
}
