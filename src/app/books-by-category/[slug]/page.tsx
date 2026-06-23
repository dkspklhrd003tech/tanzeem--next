import { db } from "@/db";
import { books, bookCategories } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { BooksCategoryGrid } from "@/components/resources/BooksCategoryGrid";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [category] = await db.select().from(bookCategories).where(eq(bookCategories.slug, slug)).limit(1);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} | Tanzeem-e-Islami Books`,
    description: category.description || `Browse books in the ${category.name} category.`,
  };
}

export default async function BooksCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category] = await db.select().from(bookCategories).where(eq(bookCategories.slug, slug)).limit(1);

  if (!category) {
    notFound();
  }

  const items = await db
    .select({
      id: books.id,
      title: books.title,
      slug: books.slug,
      description: books.description,
      coverImage: books.coverImage,
      fileUrl: books.fileUrl,
      isPublished: books.isPublished,
      orderIndex: books.order,
    })
    .from(books)
    .where(eq(books.categoryId, category.id))
    .orderBy(asc(books.order), desc(books.publishedAt));

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-muted-foreground">{category.description}</p>
            )}
          </div>
          <BooksCategoryGrid categoryName={category.name} initialItems={items} />
        </div>
      </div>
    </main>
  );
}
