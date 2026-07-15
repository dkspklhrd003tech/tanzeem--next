"use client";

import { Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {directVideos.map((video) => (
            <Link key={video.id}
              href={`/videos/${video.id}`}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-card hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-primary transition-colors line-clamp-2">
                  {video.title}
                </h3>
                {video.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{video.description}</p>}

                {video.duration && (
                  <span className="inline-block mt-3 bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-mono font-medium">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              <div className="shrink-0 flex flex-col items-center justify-center gap-1">
                <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm">
                  <Video className="w-7 h-7" />
                </button>
                <span className="text-[11px] text-foreground font-medium transition-opacity">Watch Now</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid of Sub Category Cards */}
      {subCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {subCategories.map((sub) => {
            const playVideo = sub.videos.length > 0 ? sub.videos[0] : null;
            return (
              <div
                key={sub.id}
                className="group flex flex-col items-center bg-transparent transition-all duration-300 text-left outline-none opacity-100"
              >
                <Link
                  href={`/videos-by-category/${sub.slug}`}
                  target={sub.customFields?.openInNewTab ? "_blank" : undefined}
                  className="w-full aspect-video rounded-xl overflow-hidden bg-card border shadow-md group-hover:shadow-xl border-border group-hover:border-primary/40 transition-all duration-500 relative mb-4 block"
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

                <Link href={`/videos-by-category/${sub.slug}`} target={sub.customFields?.openInNewTab ? "_blank" : undefined} className="text-center w-full px-2 hover:opacity-80 transition-opacity">
                  <h3 className="text-lg md:text-xl font-semibold transition-colors duration-300 text-foreground group-hover:text-primary text-center mx-auto">
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
