"use client";

import { Video, X } from "lucide-react";
import { cn, resolveCategoryHref } from "@/lib/utils";
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

  function formatDuration(secs: number | null) {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-12">
      {/* Direct Videos Grid (Only show when inside a sub-category) */}
      {directVideos.length > 0 && subCategories.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {directVideos.map((video) => {
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
      {subCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {subCategories.map((sub) => {
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
