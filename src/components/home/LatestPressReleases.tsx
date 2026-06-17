"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PressReleaseItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  publishedAt?: Date | string | null;
};

type Props = {
  items: PressReleaseItem[];
};

export function LatestPressReleases({ items }: Props) {
  const [selected, setSelected] = useState<PressReleaseItem | null>(null);

  const openDialog = useCallback((item: PressReleaseItem) => setSelected(item), []);
  const closeDialog = useCallback(() => setSelected(null), []);

  if (!items.length) return null;

  return (
    <section aria-labelledby="press-heading" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 id="press-heading" className="font-amiri text-2xl md:text-3xl font-bold text-primary">Latest Press Releases</h2>
            <p className="text-foreground-muted mt-1">Official announcements from Tanzeem-e-Islami</p>
          </div>
          <Link
            href="/resources/press-releases"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openDialog(item)}
              className={cn(
                "bg-card border border-border rounded-md p-5 text-left w-full",
                "hover:border-primary/30 transition-colors cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              )}
            >
              <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "\u2014"}
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
              {item.excerpt && (
                <p className="mt-2 text-sm text-foreground-muted line-clamp-3">{item.excerpt}</p>
              )}
              <Button variant="link" className="px-0 mt-3 h-auto text-primary" tabIndex={-1}>
                Read full release
              </Button>
            </motion.button>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/resources/press-releases"
            className="text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            View all press releases →
          </Link>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none dynamic-content"
            dangerouslySetInnerHTML={{ __html: selected?.content || "" }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
