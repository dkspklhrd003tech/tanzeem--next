"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, Printer, Share2, FileText, X,
  ChevronRight, Check, AlertCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMediaTracking } from "@/hooks/useMediaTracking";

export interface Book {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  fileUrl?: string | null;
  isPublished: boolean;
  orderIndex?: number | null;
}

interface BooksCategoryGridProps {
  categoryName: string;
  initialItems: Book[];
}

export function BooksCategoryGrid({ categoryName, initialItems }: BooksCategoryGridProps) {
  const [items] = useState<Book[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Book | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const { trackShare, trackDownload } = useMediaTracking("book");

  useEffect(() => {
    if (selectedItem) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q)));
    }
    return result;
  }, [items, searchQuery]);

  const handleShare = async (item: Book) => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    const shareUrl = `${window.location.href}?book=${item.id}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        toast({ title: "Link copied!", description: "Book link copied to clipboard." });
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (e) {
      console.error("Failed to copy:", e);
    }

    // Track without blocking
    trackShare(item.id).catch(console.error);

    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url: shareUrl });
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Error sharing:", err);
      }
    }
  };

  const handleDownload = async (item: Book) => {
    if (!item.fileUrl) return;
    await trackDownload(item.id);
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.download = `${item.slug || "book"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloading...", description: "Your PDF download has started." });
  };

  const handlePrint = (item: Book) => {
    if (item.fileUrl && printIframeRef.current) {
      printIframeRef.current.src = item.fileUrl;
      setTimeout(() => {
        try {
          printIframeRef.current?.contentWindow?.focus();
          printIframeRef.current?.contentWindow?.print();
        } catch (e) {
          window.open(item.fileUrl!, "_blank");
        }
      }, 500);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-7xl mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#0d5844]" />
          <Input
            placeholder={`Search in ${categoryName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-background border-border/80 focus-visible:ring-primary/20 rounded-xl"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Books Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredItems.map((item, idx) => (
            <Link
              href={item.slug.startsWith('http') || item.slug.startsWith('/') ? item.slug : `/books/${item.slug}`}
              target={item.slug.startsWith('http') ? '_blank' : undefined}
              key={item.id}
              className="group relative bg-card border bg-slate-50 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-300 shadow-sm flex flex-col"
            >
              <div className="w-full aspect-[10/16] bg-muted relative border-b border-border">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 bg-slate-200">
                    <FileText className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary hover:bg-primary-light hover:border-primary/70 hover:shadow-md hover:shadow-primary/10 transition-colors duration-200 text-center mb-2 line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      <iframe ref={printIframeRef} className="hidden" title="PDF Printing Handler" />


    </div>
  );
}
