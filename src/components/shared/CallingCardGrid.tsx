import React from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, PlayCircle, BookOpen } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export type CallingItemType = "audio" | "video" | "book";

export interface CallingItem {
  title: string;
  link: string;
  type: CallingItemType;
  thumbnailUrl?: string | null;
}

interface CallingCardGridProps {
  heading?: string;
  icon?: string;
  items: CallingItem[];
  viewAllUrl?: string;
  viewAllLabel?: string;
}

function resolveVideoThumb(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http") && (url.endsWith(".jpg") || url.endsWith(".png") || url.endsWith(".webp") || url.endsWith(".avif") || url.includes("/uploads/"))) {
    return url;
  }
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

export function CallingCardGrid({ heading, icon, items, viewAllUrl, viewAllLabel }: CallingCardGridProps) {
  const IconComponent = icon && (LucideIcons as any)[icon] ? (LucideIcons as any)[icon] : null;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      {(heading || viewAllUrl) && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              {IconComponent && <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />}
              {heading}
            </h2>
          )}
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="text-white bg-primary px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              {viewAllLabel || "View All"} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          if (item.type === "video") {
            const thumb = resolveVideoThumb(item.thumbnailUrl || item.link);
            return (
              <Link
                key={idx}
                href={item.link}
                className="group flex flex-col bg-card border border-border/80 hover:border-primary/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-video w-full relative overflow-hidden bg-muted">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <PlayCircle className="w-10 h-10 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 flex items-center justify-center transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-105">
                      <PlayCircle className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </Link>
            );
          }

          let IconComp = AudioLines;
          let actionText = "Listen Now";

          if (item.type === "book") {
            IconComp = BookOpen;
            actionText = "Read Now";
          }

          return (
            <Link
              key={idx}
              href={item.link}
              className="group block rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors p-5 border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-between gap-4 h-full">
                <p className="text-xs font-semibold text-foreground line-clamp-3 leading-snug flex-1 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">{actionText}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
