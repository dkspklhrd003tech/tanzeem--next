"use client";

import { PlayCircle, Video, X } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {directVideos.map((video) => (
            <Link
              href={`/videos/${video.id}`}
              key={video.id}
              className="group text-left bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden flex flex-col block w-full"
            >
              <div className="w-full aspect-video bg-muted relative overflow-hidden">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Video className="w-8 h-8 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">{video.title}</h4>
                {video.description && (
                  <p className="text-xs text-foreground-muted mt-2 line-clamp-2">{video.description}</p>
                )}
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
                {playVideo ? (
                  <Link
                    href={`/videos/${playVideo.id}`}
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
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={`/videos-by-category/${sub.slug}`}
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
                )}

                <Link href={`/videos-by-category/${sub.slug}`} className="text-center w-full px-2 hover:opacity-80 transition-opacity">
                  <h3 className="text-lg md:text-xl font-semibold transition-colors duration-300 text-foreground group-hover:text-primary">
                    {sub.name}
                  </h3>
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
