"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, BookOpen, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type BookItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  fileUrl: string | null;
  pages: number | null;
  language: string;
  authorName: string | null;
  downloadCount: number;
  category: { id: string; name: string; slug: string } | null;
};

type Category = { id: string; name: string; slug: string; bookCount?: number };

const LANGUAGES = [
  { value: "urdu",    label: "Urdu" },
  { value: "english", label: "English" },
  { value: "arabic",  label: "Arabic" },
];

interface BooksListingProps {
  items: BookItem[];
  categories: Category[];
  activeCategorySlug: string;
  activeLanguage: string;
  searchQuery: string;
  page: number;
  totalPages: number;
  total: number;
}

export function BooksListing({
  items, categories, activeCategorySlug, activeLanguage,
  searchQuery, page, totalPages, total,
}: BooksListingProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchQuery);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (activeCategorySlug) params.set("category", activeCategorySlug);
    if (activeLanguage)     params.set("language",  activeLanguage);
    if (searchQuery)        params.set("q",          searchQuery);
    Object.entries(overrides).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
    params.delete("page");
    return `/books?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ q })));
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-1">Our Books</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Islamic Books Library</h1>
        <p className="text-foreground-muted">{total} book{total !== 1 ? "s" : ""} available</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books…" className="pl-9" />
        </div>
        <Button type="submit" className="bg-primary text-primary-foreground">Search</Button>
      </form>

      {/* Language filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href={buildUrl({ language: "" })} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", !activeLanguage ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground-muted hover:border-primary hover:text-primary")}>
          All Languages
        </Link>
        {LANGUAGES.map((l) => (
          <Link key={l.value} href={buildUrl({ language: l.value })} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", activeLanguage === l.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground-muted hover:border-primary hover:text-primary")}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={buildUrl({ category: "" })} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", !activeCategorySlug ? "bg-primary/10 text-primary border-primary/30" : "border-border text-foreground-muted hover:border-primary/40 hover:text-primary")}>
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={buildUrl({ category: cat.slug })} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", activeCategorySlug === cat.slug ? "bg-primary/10 text-primary border-primary/30" : "border-border text-foreground-muted hover:border-primary/40 hover:text-primary")}>
              {cat.name} ({cat.bookCount || 0})
            </Link>
          ))}
        </div>
      )}

      {/* Book covers grid */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground-muted">No books found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {items.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 12) * 0.03 }}
              className="group flex flex-col items-center"
            >
              {/* Cover */}
              <Link href={`/books/${book.slug}`} className="w-full block mb-3 relative">
                <div className="relative w-full rounded-xl overflow-hidden border border-border bg-muted shadow-sm group-hover:shadow-mid transition-all duration-300 group-hover:-translate-y-1.5"
                  style={{ aspectRatio: "3/4" }}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <BookOpen className="h-8 w-8 text-primary/30" />
                    </div>
                  )}
                </div>
                {book.language && book.language !== "urdu" && (
                  <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded capitalize">
                    {book.language}
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="w-full text-center px-1">
                <Link href={`/books/${book.slug}`} className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {book.title}
                </Link>
                {book.authorName && (
                  <p className="text-[10px] text-foreground-muted mt-0.5">{book.authorName}</p>
                )}
              </div>

              {/* Download button */}
              {book.fileUrl && (
                <a
                  href={book.fileUrl}
                  download
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/30 rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={`Download ${book.title}`}
                >
                  <Download className="h-2.5 w-2.5" />
                  Download
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors">Previous</Link>}
          <span className="text-sm text-foreground-muted px-2">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors">Next</Link>}
        </div>
      )}
    </div>
  );
}
