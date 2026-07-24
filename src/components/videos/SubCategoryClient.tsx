"use client";

import { useState } from "react";
import { Video, ArrowUp, ArrowDown } from "lucide-react";
import { cn, resolveCategoryHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
};

type SubCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  customFields?: Record<string, any>;
  videos: VideoItem[];
};

function resolveVideoThumb(thumbnailUrl: string | null, videoUrl: string, embedUrl: string | null): string | null {
  if (thumbnailUrl) return thumbnailUrl;
  const url = videoUrl || embedUrl || "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

export function SubCategoryClient({ subCategories, directVideos = [] }: { subCategories: SubCategory[], directVideos?: VideoItem[] }) {
  const [sortOrder, setSortOrder] = useState<"uploaded" | "oldest">("uploaded");

  const displayedSubCategories = sortOrder === "oldest" ? [...subCategories].reverse() : subCategories;
  const displayedDirectVideos = sortOrder === "oldest" ? [...directVideos].reverse() : directVideos;

  function formatDuration(secs: number | null) {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Sort Controls */}
      {(subCategories.length > 0 || directVideos.length > 0) && (
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {subCategories.length > 0 ? `Sub-categories (${subCategories.length})` : `Videos (${directVideos.length})`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Sort Order:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "uploaded" ? "oldest" : "uploaded")}
              className="h-8 text-xs gap-1.5 bg-primary text-white hover:border-primary shadow-none font-medium hover:text-primary hover:bg-primary-light text-white transition-all"
              title={sortOrder === "uploaded" ? "Currently: Newest (Click to Oldest)" : "Currently: Oldest (Click for Newest)"}
            >
              {sortOrder === "uploaded" ? (
                <>
                  <ArrowUp className="w-3.5 h-3.5 text-white hover:text-primary shrink-0 " />
                  <span>Newest</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5 text-white hover:text-primary shrink-0 " />
                  <span>Oldest</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Direct Videos Grid (Only show when inside a sub-category) */}
      {displayedDirectVideos.length > 0 && subCategories.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedDirectVideos.map((video) => {
            const thumb = resolveVideoThumb(video.thumbnailUrl, video.videoUrl, video.embedUrl);
            return (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="group flex flex-col bg-card border border-border/80 hover:border-primary/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-video w-full relative overflow-hidden bg-muted">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <Video className="w-10 h-10 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 flex items-center justify-center transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-105">
                      <Video className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Grid of Sub Category Cards */}
      {displayedSubCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedSubCategories.map((sub) => {
            const playVideo = sub.videos.length > 0 ? sub.videos[0] : null;
            const { href, isExternal, openInNewTab: isExtOpen } = resolveCategoryHref(sub.slug, "/videos-by-category");
            const target = (sub.customFields?.openInNewTab || isExtOpen) ? "_blank" : undefined;
            const rel = isExternal ? "noopener noreferrer" : undefined;
            return (
              <div
                key={sub.id}
                className="group flex flex-col items-center bg-transparent transition-all duration-300 text-left outline-none opacity-100"
              >
                <Link
                  href={href}
                  target={target}
                  rel={rel}
                  className="w-full aspect-[8/5] rounded-xl overflow-hidden bg-card border shadow-md group-hover:shadow-xl border-border group-hover:border-primary/40 transition-all duration-500 relative mb-4 block"
                >
                  {sub.imageUrl ? (
                    <img
                      src={sub.imageUrl}
                      alt={sub.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                      <span className="text-muted-foreground/50 text-sm font-medium">No Thumbnail</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </Link>

                <Link href={href} target={target} rel={rel} className="text-center w-full px-2 min-w-0 hover:opacity-80 transition-opacity">
                  <h3 className="text-lg md:text-xl font-semibold transition-colors duration-300 text-foreground group-hover:text-primary text-center mx-auto line-clamp-2">
                    {sub.name}
                  </h3>
                  {sub.customFields?.urduName && (
                    <div className="w-full flex justify-center mt-1">
                      <p className="text-lg md:text-2xl font-nastaleeq font-semibold text-foreground text-center" dir="rtl">
                        {sub.customFields.urduName}
                      </p>
                    </div>
                  )}
                  <span className="text-xs font-normal text-primary bg-primary/10 px-3 py-1 rounded-full mt-2 inline-block">
                    {sub.videos.length} Videos
                  </span>
                  {sub.description && (
                    <p className="text-sm text-foreground-muted mt-2 line-clamp-2 max-w-xs mx-auto">{sub.description}</p>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
