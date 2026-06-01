"use client";

import { useState } from "react";
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

  if (!items.length) return null;

  return (
    <section className="py-16 bg-[#f5f5f0]">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-primary">Latest Press Releases</h2>
            <p className="text-foreground-muted mt-1">Official announcements from Tanzeem-e-Islami</p>
          </div>
          <Link
            href="/resources/press-releases"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-md p-5 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
                <Calendar className="h-3.5 w-3.5" />
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
              {item.excerpt && (
                <p className="mt-2 text-sm text-foreground-muted line-clamp-3">{item.excerpt}</p>
              )}
              <Button variant="link" className="px-0 mt-3 h-auto text-primary">
                Read full release
              </Button>
            </motion.article>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/resources/press-releases" className="text-sm font-medium text-primary">
            View all press releases →
          </Link>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
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
