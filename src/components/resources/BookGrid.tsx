"use client";

import { useState, useMemo } from "react";
import { Download, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type BookItem = {
  id: string;
  title: string;
  authorName?: string | null;
  coverImage?: string | null;
  fileUrl?: string | null;
  description?: string | null;
  categoryName?: string | null;
};

type Props = { items: BookItem[] };

export function BookGrid({ items }: Props) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      items.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          (b.authorName || "").toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((book) => (
          <article
            key={book.id}
            className="border border-border rounded-md overflow-hidden bg-card flex flex-col"
          >
            <div className="aspect-[3/4] bg-muted relative">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary">
                  <BookOpen className="h-12 w-12 opacity-40" />
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
              {book.authorName && (
                <p className="text-xs text-foreground-muted mt-1">{book.authorName}</p>
              )}
              {book.fileUrl && (
                <Button asChild size="sm" variant="outline" className="mt-3 w-full border-primary text-primary">
                  <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
