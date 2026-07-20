"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, FileText } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import { Button } from "@/components/ui/button";


export type PressReleaseItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  slug: string;
  publishedAt?: Date | string | null;
};

type Props = {
  items: PressReleaseItem[];
};

export function LatestPressReleases({ items }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        }
      );

      const cards = gsap.utils.toArray(".press-card");
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 80, scale: 0.95, rotateX: 10 },
          {
            opacity: 1, y: 0, scale: 1, rotateX: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: gridRef.current, start: "top 75%" }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section ref={sectionRef} aria-labelledby="press-heading" className="py-10 px-6 bg-primary-light relative overflow-hidden perspective-1000 border-t border-border/20">
      <div className="absolute pointer-events-none" />
      <div className="container max-w-7xl mx-auto relative z-10">
        <div ref={headerRef} className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 gap-6 text-center md:text-left">
          <div>
            <h2 id="press-heading" className="spotlight_heading">News & Updates</h2>
            <p className="text-foreground font-medium tracking-normal uppercase text-sm">
              Latest Press Releases
            </p>
          </div>
          <Link
            href="/press-releases"
            className={cn(
              "group inline-flex items-center gap-3 border border-primary/50 bg-primary text-white backdrop-blur-md",
              "px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg",
              "hover:bg-primary hover:border-primary transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            )}
          >
            View all <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length > 0 ? items.slice(0, 6).map((item, i) => (
            <Link
              key={item.id}
              href={`/press-releases/${item.slug || item.id}`}
              className={cn(
                "press-card group relative flex flex-col bg-background/60 backdrop-blur-md border border-border/50 rounded-[1.5rem] p-6 text-left w-full shadow-sm",
                "hover:shadow-[0_10px_40px_rgba(16,185,129,0.1)] hover:border-primary/40 hover:-translate-y-2 transition-all duration-700 cursor-pointer overflow-hidden",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              )}
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                <FileText className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-4 bg-primary/10 w-fit px-3 py-1 rounded-full">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span suppressHydrationWarning>
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "\u2014"}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-md leading-snug line-clamp-2 relative z-10 group-hover:text-primary transition-colors duration-500">{item.title}</h3>
              {item.excerpt && (
                <p className="mt-4 text-sm text-foreground-muted line-clamp-3 leading-relaxed relative z-10">{item.excerpt}</p>
              )}
              {/* <div className={cn(
                "mt-auto self-start inline-flex items-center gap-3 border border-primary/50 text-[#222222] hover:text-white backdrop-blur-md mt-4",
                "px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg",
                "hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              )}>
                <span>Read Press Release</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div> */}
            </Link>
          )) : null}
          {items.length === 0 && null}
        </div>

      </div>
    </section>

  );
}
