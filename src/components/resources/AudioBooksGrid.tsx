"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Search,
  ChevronRight,
  AlertCircle,
  AudioLines
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface AudioBook {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  audioUrl?: string | null;
  authorName?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  orderIndex?: number | null;
}

interface AudioBooksGridProps {
  initialItems: AudioBook[];
}

export function AudioBooksGrid({ initialItems }: AudioBooksGridProps) {
  const [items] = useState<AudioBook[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const { toast } = useToast();

  // Filter and Sort Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
          item.content.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const orderA = a.orderIndex ?? 0;
      const orderB = b.orderIndex ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchQuery, sortBy]);

  return (
    <div className="w-full">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-7xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#0d5844]" />
          <Input
            placeholder="Search Audio Books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-background border-border/80 focus-visible:ring-primary/20 rounded-xl"
          />
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="h-12 bg-background border border-border rounded-xl px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30 min-w-[120px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Audio Books Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredItems.map((item, idx) => {
            const hasAudio = !!item.audioUrl;
            const dateStr = item.publishedAt || item.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "Recent";

            return (
              <Link href={`/audio-books/${item.slug || item.id}`} key={item.id} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="relative bg-card border bg-slate-100 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Visual Top Bar / Image */}
                  {item.featuredImage ? (
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <AudioLines className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "h-2 w-full shrink-0",
                        hasAudio
                          ? "bg-primary"
                          : "bg-gradient-to-r from-secondary to-primary"
                      )}
                    />
                  )}

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Meta Section */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex bg-primary-light rounded-full shadow-sm border-primary border items-center gap-1.5 px-2 py-1 text-xs font-semibold text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Title + speaker */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-gray-400 text-xs font-medium truncate mb-0.5">
                          {item.authorName || "Unknown Speaker"}
                        </span>
                        <h3 className="font-bold text-foreground text-md leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {item.title}
                        </h3>
                      </div>

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
