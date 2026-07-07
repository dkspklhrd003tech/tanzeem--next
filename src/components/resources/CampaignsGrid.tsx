"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Search,
  Image,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
  createdAt?: Date | string | null;
  createdAt?: Date | string | null;
  orderIndex?: number | null;
}

interface CampaignsGridProps {
  initialItems: Campaign[];
}

export function CampaignsGrid({ initialItems }: CampaignsGridProps) {
  const [items] = useState<Campaign[]>(initialItems);
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
      const dateA = new Date(a.createdAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.createdAt || 0).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchQuery, sortBy]);

  return (
    <div className="w-full">
      {/* Search & Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-[#0d5844]/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-5xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#0d5844]" />
            <Input
              placeholder="Search campaigns..."
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
      </div>

      {/* Grid View */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No campaigns Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => {
            const hasimage = !!item.imageUrl;
            const dateStr = item.createdAt || item.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "Recent";

            return (
              <Link href={`/campaigns/${item.slug || item.id}`} key={item.id} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="relative bg-card border bg-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col"
                >
                  {/* Visual Top Bar */}
                  <div
                    className={cn(
                      "h-2 w-full shrink-0",
                      hasimage
                        ? "bg-primary"
                        : "bg-gradient-to-r from-secondary to-primary"
                    )}
                  />

                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Meta Section */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-foreground text-lg leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3">
                          {item.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Card Action Footer */}
                    {/* <div className="flex items-center justify-between pt-4 mt-5 border-t border-border/50">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        {hasimage ? "Read PR" : "Read PR"}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div> */}
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

