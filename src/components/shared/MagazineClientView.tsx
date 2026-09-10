"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookOpen } from "lucide-react";

export interface MagazineLink {
  id: string;
  title: string;
  slug?: string;
  url: string;
  isActive: boolean;
}

export function MagazineClientView({ links }: { links: MagazineLink[] }) {

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <Link
            href={`/magazines/${link.slug}`}
            key={link.id}
            className="group relative flex flex-col items-start justify-between p-5 md:p-6 overflow-hidden rounded-xl bg-card shadow-sm hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 text-left hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 block w-full"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
          >
            {/* Cinematic background gradient that appears on hover */}
            <div className="absolute inset-0 bg-primary-light duration-500 border border-primary rounded-xl pointer-events-none" />

            <div className="relative z-10 w-full flex items-center justify-between gap-4">
              <h3 className="text-base md:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-1">
                {link.title}
              </h3>

              <div className="flex flex-col items-center shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-foreground">Read Now</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </>
  );
}
