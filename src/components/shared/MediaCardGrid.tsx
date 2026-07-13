"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Headphones, ArrowRight } from "lucide-react";

interface MediaItem {
  title: string;
  image: string;
  type: "video" | "audio";
  link: string;
}

interface MediaCardGridProps {
  heading?: string;
  items: MediaItem[];
  columns?: 2 | 3 | 4;
  viewAllUrl?: string;
}

export function MediaCardGrid({ heading, items, columns = 3, viewAllUrl = "/resources" }: MediaCardGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-16 md:py-10 bg-background">
      <div className="container px-4 mx-auto">
        {heading && (
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {heading}
            </h2>
            <Link href={viewAllUrl} className="text-primary font-bold inline-flex items-center gap-2 hover:underline">
              View All Resources <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Link href={item.link} className="block space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border group-hover:border-primary/30 transition-all duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                      {item.type === "video" ? <Play className="w-6 h-6 fill-current" /> : <Headphones className="w-6 h-6" />}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
