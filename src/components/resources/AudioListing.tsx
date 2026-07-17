"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Headphones, PlayCircle, Clock, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type AudioItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  duration: number | null;
  thumbnailUrl: string | null;
  playCount: number;
  downloadCount: number;
  category: { id: string; name: string; slug: string } | null;
  speaker: { id: string; name: string; slug: string } | null;
};

type Category = { id: string; name: string; slug: string };
type Speaker = { id: string; name: string; slug: string };

interface AudioListingProps {
  items: AudioItem[];
  categories: Category[];
  speakers: Speaker[];
  activeCategorySlug: string;
  activeSpeakerSlug: string;
  searchQuery: string;
  page: number;
  totalPages: number;
  total: number;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioListing({
  items,
  categories,
  speakers,
  activeCategorySlug,
  activeSpeakerSlug,
  searchQuery,
  page,
  totalPages,
  total,
}: AudioListingProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchQuery);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (activeCategorySlug) params.set("category", activeCategorySlug);
    if (activeSpeakerSlug) params.set("speaker", activeSpeakerSlug);
    if (searchQuery) params.set("q", searchQuery);
    if (page > 1) params.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    params.delete("page"); // reset page on any filter change
    return `/audio?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ q })));
  }

  return (
    <div className="container max-w-7xl mx-auto py-10">

      {/* Header */}
      <div className="mb-6">
        <p className="text-foreground-muted">
          {total} lecture{total !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lectures…"
            className="pl-9"
          />
        </div>
        <Button type="submit" className="bg-primary text-white">Search</Button>
      </form>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            href={buildUrl({ category: "" })}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              !activeCategorySlug
                ? "bg-primary text-white border-primary"
                : "border-border text-foreground-muted hover:border-primary hover:text-primary"
            )}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl({ category: cat.slug })}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeCategorySlug === cat.slug
                  ? "bg-primary text-white border-primary"
                  : "border-border text-foreground-muted hover:border-primary hover:text-primary"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Speaker tabs */}
      {speakers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={buildUrl({ speaker: "" })}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              !activeSpeakerSlug
                ? "bg-primary/10 text-primary border-primary/30"
                : "border-border text-foreground-muted hover:border-primary/40 hover:text-primary"
            )}
          >
            All Speakers
          </Link>
          {speakers.map((sp) => (
            <Link
              key={sp.id}
              href={buildUrl({ speaker: sp.slug })}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeSpeakerSlug === sp.slug
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border text-foreground-muted hover:border-primary/40 hover:text-primary"
              )}
            >
              {sp.name}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Headphones className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground-muted">No lectures found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 8) * 0.04 }}
            >
              <Link
                href={`/audio/${item.slug}`}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-mid transition-all hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Headphones className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {formatDuration(item.duration)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  {item.category && (
                    <Badge variant="outline" className="text-[10px] mb-1.5 text-primary border-primary/20">
                      {item.category.name}
                    </Badge>
                  )}
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  {item.speaker && (
                    <p className="text-xs text-foreground-muted mt-1">{item.speaker.name}</p>
                  )}

                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors">
              Previous
            </Link>
          )}
          <span className="text-sm text-foreground-muted px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
