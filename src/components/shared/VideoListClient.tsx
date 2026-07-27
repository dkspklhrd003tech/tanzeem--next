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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vids.map((v: any) => {
          const thumb = getThumb(v);
          return (
            <Link
              key={v.id}
              href={v.slug?.startsWith('http') ? v.slug : `/videos/${v.slug || v.id}`}
              target={v.customFields?.openInNewTab ? "_blank" : undefined}
              rel={v.customFields?.openInNewTab ? "noopener noreferrer" : undefined}
              className="group flex flex-col bg-card border border-border/80 hover:border-primary/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-video w-full relative overflow-hidden bg-muted">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={v.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Play className="w-10 h-10 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center shadow-lg transition-all transform scale-90 group-hover:scale-100">
                    <Video className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="p-4 text-center flex-1 flex flex-col justify-center">
                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
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
