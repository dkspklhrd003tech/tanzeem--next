"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
            className="group relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 text-left hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 block w-full"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
          >
            {/* Cinematic background gradient that appears on hover */}
            <div className="absolute inset-0 bg-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 w-full">
              <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {link.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

    </>
  );
}
