"use client";

import Link from "next/link";
import { ArrowLeft, Download, BookOpen, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookDetailProps {
  book: {
    id: string;
    title: string;
    description?: string | null;
    coverImage?: string | null;
    fileUrl?: string | null;
    authorName?: string | null;
    categoryName?: string | null;
    pages?: number | null;
  };
  backHref: string;
  backLabel: string;
}

export function BookDetail({ book, backHref, backLabel }: BookDetailProps) {
  return (
    <div className="container mx-auto py-8 md:py-10 px-4">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Cover */}
        <div className="md:col-span-1">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full aspect-[3/4] rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-xl bg-primary/10 flex items-center justify-center shadow-lg">
              <BookOpen className="h-20 w-20 text-primary/40" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{book.title}</h1>
            {book.authorName && (
              <p className="flex items-center gap-2 text-lg text-primary">
                <User className="h-4 w-4" /> {book.authorName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {book.pages && (
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {book.pages} pages
              </span>
            )}
            {book.categoryName && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> {book.categoryName}
              </span>
            )}
          </div>

          {book.description && (
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
          )}

          {book.fileUrl && (
            <div className="flex gap-3">
              <Button asChild variant="default" className="gap-2">
                <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-4 w-4" /> Read Online
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href={book.fileUrl} download>
                  <Download className="h-4 w-4" /> Download
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
