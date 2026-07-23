"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import { resolveCategoryHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CategoryGridItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  customFields?: Record<string, any>;
  count: number;
}

export function CategoryGridClient({ categories }: { categories: CategoryGridItem[] }) {
  const [sortOrder, setSortOrder] = useState<"uploaded" | "inverse">("uploaded");

  const displayedCategories = sortOrder === "inverse" ? [...categories].reverse() : categories;

  return (
    <div className="space-y-6">
      {/* Top Header / Sort Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Categories ({categories.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Sort Order:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "uploaded" ? "inverse" : "uploaded")}
            className="h-8 text-xs gap-1.5 border-border shadow-none font-medium hover:text-primary transition-all"
            title={sortOrder === "uploaded" ? "Currently: Uploaded Order (Click to inverse)" : "Currently: Inverse Order (Click for uploaded order)"}
          >
            {sortOrder === "uploaded" ? (
              <>
                <ArrowUp className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Uploaded Order</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Inverse Order</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {displayedCategories.map((cat) => {
          const { href, isExternal, openInNewTab: isExtOpen } = resolveCategoryHref(cat.slug, "/videos-by-category");
          const target = (cat.customFields?.openInNewTab || isExtOpen) ? "_blank" : undefined;
          const rel = isExternal ? "noopener noreferrer" : undefined;
          return (
            <Link
              key={cat.id}
              href={href}
              target={target}
              rel={rel}
              className="group flex flex-col items-center bg-transparent transition-all duration-300"
            >
              {/* 16:9 Thumbnail Image */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-card border border-border shadow-md group-hover:shadow-xl group-hover:border-primary/40 transition-all duration-500 relative mb-4">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                    <span className="text-muted-foreground/50 text-sm font-medium">No Thumbnail</span>
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Text Content Below */}
              <div className="text-center w-full px-2 min-w-0">
                <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {cat.name}
                </h3>
                {cat.customFields?.urduName && (
                  <p className="text-sm text-muted-foreground text-center line-clamp-1 mt-1" dir="rtl">
                    {cat.customFields.urduName}
                  </p>
                )}
                <span className="text-xs font-normal text-primary bg-primary/10 px-3 py-1 rounded-full mt-2 inline-block">
                  {cat.count} Videos
                </span>
                {cat.description && (
                  <p className="text-sm text-foreground-muted mt-2 line-clamp-2 max-w-xs mx-auto">{cat.description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
