import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { books } from "@/db/schema";
import { eq, and, ne, asc, desc } from "drizzle-orm";
import { BookOpen, Download, Share2, ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildMetadata, bookJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ClientShareButton } from "@/components/shared/ClientShareButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await db.query.books.findFirst({
    where: and(eq(books.slug, slug), eq(books.isPublished, true)),
  });
  if (!book) return { title: "Book Not Found" };
  return buildMetadata({
    title: book.metaTitle ?? book.title,
    description: book.metaDescription ?? book.description ?? undefined,
    path: `/books/${slug}`,
    ogImage: book.coverImage,
    keywords: ["Islamic book", book.language, book.authorName ?? "", "free download"].filter(Boolean),
  });
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;

  const book = await db.query.books.findFirst({
    where: and(eq(books.slug, slug), eq(books.isPublished, true)),
    with: { category: true },
  });
  if (!book) notFound();

  const related = await db.query.books.findMany({
    where: and(
      eq(books.isPublished, true),
      ne(books.id, book.id),
      book.categoryId ? eq(books.categoryId, book.categoryId) : undefined
    ),
    with: { category: true },
    orderBy: [asc(books.order), desc(books.createdAt)],
    limit: 6,
  });

  const ld = bookJsonLd({
    title: book.title,
    description: book.description,
    slug: book.slug,
    coverImage: book.coverImage,
    authorName: book.authorName,
    language: book.language,
    datePublished: book.publishedAt,
  });
  const bc = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Books", path: "/books" },
    { name: book.title, path: `/books/${book.slug}` },
  ]);

  return (
    <main className=" bg-background">
      <script id="jsonld-book" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script id="jsonld-book-bc" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }} />
      <div className="container max-w-5xl mx-auto py-10">

        {/* Back */}
        <Link href="/books-by-category" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Books Library
        </Link>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              {book.category && (
                <Badge variant="outline" className="bg-primary-light text-primary border-primary/30">{book.category.name}</Badge>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">{book.title}</h1>
                <ClientShareButton variant="icon" />
              </div>
            </div>

            {book.fileUrl && (
              <a
                href={book.fileUrl}
                download
                className="inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/80 border-primary border h-12 font-medium shadow-sm rounded-md px-6 py-2 text-sm font-semibold transition-colors shrink-0"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            )}
          </div>

          {book.description && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted mb-2">About this Book</h2>
              <p className="text-foreground-muted leading-relaxed text-sm">{book.description}</p>
            </div>
          )}

          {book.fileUrl && (
            <div className="mt-4">
              <div className="w-full h-[85vh] rounded-xl overflow-hidden border border-border shadow-xl bg-white relative">
                <iframe
                  src={`${book.fileUrl}#toolbar=1`}
                  className="w-full h-full border-none"
                  title={book.title}
                  allow="autoplay; fullscreen"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Books</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/books/${r.slug}`} className="group flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg overflow-hidden border border-border bg-muted group-hover:shadow-mid transition-all group-hover:-translate-y-1 duration-300" style={{ aspectRatio: "3/4" }}>
                    {r.coverImage ? (
                      <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <BookOpen className="h-6 w-6 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-foreground group-hover:text-primary line-clamp-2 text-center transition-colors leading-snug">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
