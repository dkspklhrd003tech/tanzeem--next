"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Headphones, ArrowUp, ArrowDown } from "lucide-react";
import { resolveCategoryHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AudioCategoryGridItem {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  customFields?: Record<string, any> | null;
  count: number;
  order?: number | null;
  createdAt?: string | Date | null;
}

export function AudioCategoryGridClient({ categories }: { categories: AudioCategoryGridItem[] }) {
  const [sortOrder, setSortOrder] = useState<"default" | "reverse">("default");

  const displayedCategories = [...categories].sort((a, b) => {
    if (sortOrder === "reverse") {
      return (b.order ?? 0) - (a.order ?? 0);
    } else {
      return (a.order ?? 0) - (b.order ?? 0);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Header / Sort Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Categories ({categories.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Sort Order:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "default" ? "reverse" : "default")}
            className="h-8 text-xs gap-1.5 bg-primary/10 text-primary border-primary/30 hover:border-primary shadow-none font-medium hover:bg-primary hover:text-white transition-all group"
            title={sortOrder === "default" ? "Currently: Default Order (Click to Reverse)" : "Currently: Reversed Order (Click for Default)"}
          >
            {sortOrder === "default" ? (
              <>
                <ArrowUp className="w-3.5 h-3.5 shrink-0 transition-colors" />
                <span>Default</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5 shrink-0 transition-colors" />
                <span>Reversed</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {displayedCategories.map((cat) => {
          const { href, isExternal, openInNewTab: isExtOpen } = resolveCategoryHref(cat.slug, "/audios-by-category");
          const target = (cat.customFields?.openInNewTab || isExtOpen) ? "_blank" : undefined;
          const rel = isExternal ? "noopener noreferrer" : undefined;
          const title = cat.code ? `${cat.code} | ${cat.name}` : cat.name;

          return (
            <Link
              key={cat.id}
              href={href}
              target={target}
              rel={rel}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3.5 rounded-2xl border border-primary/30 hover:border-primary/60 bg-muted/30 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md h-full"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-md text-foreground group-hover:text-primary transition-colors leading-snug text-left line-clamp-2">
                  {title}
                </h3>
                {cat.customFields?.urduName && (
                  <p className="text-sm text-muted-foreground mt-1" dir="rtl">{cat.customFields.urduName}</p>
                )}
                {cat.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{cat.description}</p>
                )}
              </div>

              <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/90 transition-all scale-95 group-hover:scale-105 shadow-sm shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold transition-opacity hidden md:block">
                  {cat.count} Audios
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
