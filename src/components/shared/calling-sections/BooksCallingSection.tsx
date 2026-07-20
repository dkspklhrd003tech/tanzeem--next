import { db } from "@/lib/db";
import { books, bookCategories, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { PublicationGrid } from "@/components/shared/PublicationGrid";

interface CallingSectionProps {
  heading?: string;
  fetchUrl?: string;
  limit?: number;
  buttonLabel?: string;
  buttonUrl?: string;
}

export async function BooksCallingSection({ heading, fetchUrl, limit = 6, buttonLabel, buttonUrl }: CallingSectionProps) {
  let slug = "";
  if (fetchUrl) {
    const parts = fetchUrl.split("/").filter(Boolean);
    slug = parts[parts.length - 1] || "";
  }

  let categoryId: string | null = null;

  if (slug) {
    const [cat] = await db.select().from(bookCategories).where(eq(bookCategories.slug, slug)).limit(1);
    if (cat) {
      categoryId = cat.id;
    }
  }

  const results = await db.select({
      book: books,
      author: users
    })
    .from(books)
    .leftJoin(users, eq(books.authorId, users.id))
    .where(
      and(
        eq(books.isPublished, true),
        categoryId ? eq(books.categoryId, categoryId) : undefined
      )
    )
    .orderBy(desc(books.createdAt))
    .limit(limit);

  if (results.length === 0) return null;

  const publications = results.map(row => ({
    title: row.book.title,
    cover: row.book.coverImage || "",
    author: row.author?.name || undefined,
    link: `/books/${row.book.slug}`
  }));

  return (
    <PublicationGrid
      heading={heading}
      publications={publications}
      viewAllUrl={buttonUrl}
      viewAllLabel={buttonLabel}
    />
  );
}
