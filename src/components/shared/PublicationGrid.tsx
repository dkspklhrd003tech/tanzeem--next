"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Download, ArrowRight } from "lucide-react";

interface Publication {
  title: string;
  cover: string;
  author?: string;
  link: string;
}

interface PublicationGridProps {
  heading?: string;
  publications: Publication[];
  viewAllUrl?: string;
}

export function PublicationGrid({ heading, publications, viewAllUrl }: PublicationGridProps) {
  return (
    <section className="py-16 md:py-10 bg-card/30">
      <div className="container px-4 mx-auto">
        {heading && (
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {heading}
            </h2>
            {viewAllUrl && (
              <Link href={viewAllUrl} className="text-primary font-bold inline-flex items-center gap-2 hover:underline">
                View All Publications <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
          {publications.map((pub, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-border group-hover:border-primary/50 transition-all duration-300">
                  <img
                    src={pub.cover}
                    alt={pub.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-4 text-center">
                    <Link
                      href={pub.link}
                      className="w-full py-2 bg-primary text-white font-bold rounded transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Read Online
                    </Link>
                    <button className="w-full py-2 bg-white/10 text-white font-bold rounded hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm backdrop-blur-md">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {pub.title}
                  </h3>
                  {pub.author && (
                    <p className="text-xs text-foreground-muted font-medium uppercase tracking-tight">
                      {pub.author}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
