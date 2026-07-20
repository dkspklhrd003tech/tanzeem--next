import React from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type CallingItemType = "audio" | "video" | "book";

export interface CallingItem {
  title: string;
  link: string;
  type: CallingItemType;
}

interface CallingCardGridProps {
  heading?: string;
  items: CallingItem[];
  viewAllUrl?: string;
  viewAllLabel?: string;
}

export function CallingCardGrid({ heading, items, viewAllUrl, viewAllLabel }: CallingCardGridProps) {
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      {(heading || viewAllUrl) && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          let IconComponent = AudioLines;
          let actionText = "Listen Now";

          if (item.type === "video") {
            IconComponent = PlayCircle;
            actionText = "Watch Now";
          } else if (item.type === "book") {
            IconComponent = BookOpen;
            actionText = "Read Now";
          }

          return (
            <Link
              key={idx}
              href={item.link}
              className="group block rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors p-5 border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-between gap-4 h-full">
                <p className="text-sm md:text-base font-semibold text-foreground line-clamp-3 leading-snug flex-1 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground">{actionText}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
