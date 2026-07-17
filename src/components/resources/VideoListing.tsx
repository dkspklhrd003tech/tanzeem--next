"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Video, PlayCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type VideoItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
  playCount?: number;
  downloadCount?: number;
  shareCount?: number;
  category: { id: string; name: string; slug: string } | null;
  speaker: { id: string; name: string; slug: string } | null;
};

type Category = { id: string; name: string; slug: string; parentId: string | null; imageUrl: string | null; code: string | null; videoCount: number; };
type Speaker = { id: string; name: string; slug: string };

interface VideoListingProps {
  items: VideoItem[];
  categories: Category[];
  speakers: Speaker[];
  activeCategorySlug: string;
  activeSpeakerSlug: string;
  searchQuery: string;
  page: number;
  totalPages: number;
  total: number;
}

function formatDuration(secs: number | null) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoListing({
  items, categories, speakers,
  activeCategorySlug, activeSpeakerSlug,
  searchQuery, page, totalPages, total,
}: VideoListingProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchQuery);

  const activeCat = categories.find(c => c.slug === activeCategorySlug);
  const activeMainCatId = activeCat?.parentId || activeCat?.id || null;
  const mainCategories = categories.filter(c => !c.parentId);
  const subCategories = activeMainCatId ? categories.filter(c => c.parentId === activeMainCatId) : [];

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (activeCategorySlug) params.set("category", activeCategorySlug);
    if (activeSpeakerSlug) params.set("speaker", activeSpeakerSlug);
    if (searchQuery) params.set("q", searchQuery);
    Object.entries(overrides).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
    params.delete("page");
    return `/videos?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ q })));
  }

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <div className="mb-6">
        <p className="text-foreground-muted">{total} video{total !== 1 ? "s" : ""} available</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos…" className="pl-9" />
        </div>
        <Button type="submit" className="bg-primary text-primary-foreground">Search</Button>
      </form>



      {subCategories.length > 0 && (
        <div className="mb-10">
          <h4 className="text-lg font-bold mb-4">{mainCategories.find(c => c.id === activeMainCatId)?.name} Sub-categories</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subCategories.map(sub => (
              <Link key={sub.id} href={buildUrl({ category: sub.slug })} className={cn("relative group border rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-colors shadow-sm", activeCategorySlug === sub.slug ? "ring-2 ring-primary border-primary" : "border-border/80")}>
                <div className="aspect-video bg-muted relative">
                  {sub.imageUrl ? (
                    <img src={sub.imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Video className="w-8 h-8 opacity-20" /></div>
                  )}
                </div>
                <div className="p-4">
                  <h5 className="font-bold text-sm truncate">{sub.code ? `${sub.code} | ` : ""}{sub.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{sub.videoCount} items inside</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground-muted">No videos found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 8) * 0.04 }}>
              <Link href={`/videos/${item.slug}`} className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-mid transition-all hover:-translate-y-1 cursor-pointer w-full">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Video className="h-10 w-10 text-primary/30" />
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
                <div className="p-3">
                  {item.category && <Badge variant="outline" className="text-[10px] mb-1.5 text-primary border-primary/20">{item.category.name}</Badge>}
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">{item.title}</h3>
                  {item.speaker && <p className="text-xs text-foreground-muted mt-1">{item.speaker.name}</p>}

                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

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
