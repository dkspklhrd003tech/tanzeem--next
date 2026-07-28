"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Headphones, AudioLines, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { resolveCategoryHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AudioSubCategoryItem {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  customFields?: Record<string, any> | null;
  order?: number | null;
  audios: any[];
}

export interface DirectAudioItem {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  audioUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  createdAt?: string | Date | null;
  order?: number | null;
}

interface AudioSubCategoryClientProps {
  subCategories: AudioSubCategoryItem[];
  directAudios?: DirectAudioItem[];
}

export function AudioSubCategoryClient({ subCategories, directAudios = [] }: AudioSubCategoryClientProps) {
  const [sortOrder, setSortOrder] = useState<"default" | "reverse">("default");

  const displayedSubCategories = [...subCategories].sort((a, b) => {
    if (sortOrder === "reverse") {
      return (b.order ?? 0) - (a.order ?? 0);
    } else {
      return (a.order ?? 0) - (b.order ?? 0);
    }
  });

  const displayedDirectAudios = [...directAudios].sort((a, b) => {
    if (sortOrder === "reverse") {
      return (b.order ?? 0) - (a.order ?? 0);
    } else {
      return (a.order ?? 0) - (b.order ?? 0);
    }
  });

  const totalItems = subCategories.length > 0 ? subCategories.length : directAudios.length;

  return (
    <div className="space-y-6">
      {/* Top Header / Sort Controls */}
      {(subCategories.length > 0 || directAudios.length > 0) && (
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
            {subCategories.length > 0 ? `Categories (${subCategories.length})` : `Audios (${directAudios.length})`}
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
      )}

      {/* Direct Audios Grid */}
      {displayedDirectAudios.length > 0 && subCategories.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedDirectAudios.map((item) => {
            return (
              <Link
                href={`/audio/${item.slug || item.id}`}
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3.5 rounded-2xl border border-primary/30 hover:border-primary/60 bg-muted/30 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md h-full"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-md group-hover:text-primary transition-colors uppercase leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/90 transition-all scale-95 group-hover:scale-105 shadow-sm shrink-0">
                    <AudioLines className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold transition-opacity hidden md:block">Listen Now</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Sub Categories Grid */}
      {displayedSubCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedSubCategories.map((sub) => {
            const { href, isExternal, openInNewTab: isExtOpen } = resolveCategoryHref(sub.slug, "/audios-by-category");
            const target = (sub.customFields?.openInNewTab || isExtOpen) ? "_blank" : undefined;
            const rel = isExternal ? "noopener noreferrer" : undefined;
            const title = sub.code ? `${sub.code} | ${sub.name}` : sub.name;

            return (
              <Link
                key={sub.id}
                href={href}
                target={target}
                rel={rel}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3.5 rounded-2xl border border-primary/30 hover:border-primary/60 bg-muted/30 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md h-full"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base md:text-md text-foreground group-hover:text-primary transition-colors leading-snug text-left line-clamp-2">
                    {title}
                  </h3>
                  {sub.customFields?.urduName && (
                    <p className="text-sm text-muted-foreground mt-1" dir="rtl">{sub.customFields.urduName}</p>
                  )}
                  {sub.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{sub.description}</p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/90 transition-all scale-95 group-hover:scale-105 shadow-sm shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold transition-opacity hidden md:block">
                    {sub.audios?.length || 0} Audios
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
