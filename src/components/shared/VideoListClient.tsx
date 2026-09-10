"use client";

import { Video } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function getThumb(video: any): string | null {
  if (video.thumbnailUrl) return video.thumbnailUrl;
  const url = video.videoUrl || video.embedUrl || "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

export function VideoListClient({ vids }: { vids: any[] }) {

  if (vids.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground text-lg">No videos found for this speaker yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {vids.map((v: any) => {
          const thumb = getThumb(v);
          return (
            <Link
              key={v.id}
              href={v.slug?.startsWith('http') ? v.slug : `/videos/${v.slug || v.id}`}
              target={v.customFields?.openInNewTab ? "_blank" : undefined}
              rel={v.customFields?.openInNewTab ? "noopener noreferrer" : undefined}
              className="group flex flex-row md:flex-col bg-card border border-border/80 hover:border-primary/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 md:w-full md:h-auto md:aspect-video relative shrink-0 overflow-hidden bg-muted">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={v.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Video className="w-8 h-8 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 flex items-center justify-center transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-105">
                    <Video className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
              {/* Title */}
              <div className="flex-1 px-3 py-2 md:p-4 flex items-center md:justify-center">
                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug md:text-center">
                  {v.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
