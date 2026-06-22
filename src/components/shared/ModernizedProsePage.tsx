"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Share2, Printer, Bookmark, Calendar, User,
  ChevronRight, Compass, Shield, BookOpen, Anchor, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { Accordion } from "@/components/shared/Accordion";
import { CTABanner } from "@/components/shared/CTABanner";
import { useSettings } from "@/hooks/use-settings";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface ModernizedProsePageProps {
  title: string;
  excerpt?: string | null;
  content: string;
  slug: string;
  breadcrumbs: BreadcrumbItem[];
  featuredImage?: string | null;
  template?: string; // Custom layout templates

  // Custom sections
  stats?: { number: string; label: string }[];
  accordionItems?: { question: string; answer: string }[];
  ideologyCards?: { title: string; href: string; description: string }[];
  ctaHeading?: string;
  ctaSubheading?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
}

export function ModernizedProsePage({
  title,
  excerpt,
  content,
  slug,
  breadcrumbs,
  featuredImage,
  template,
  stats,
  accordionItems,
  ideologyCards,
  ctaHeading,
  ctaSubheading,
  ctaButtonLabel,
  ctaButtonUrl
}: ModernizedProsePageProps) {
  const pathname = usePathname() || "";

  // Clean up content: replace empty paragraphs or extra line breaks
  const cleanContent = content ? content.trim().replace(/<p><\/p>/g, "") : "";

  // Helper to generate dynamic sidebar navigation items
  const sidebarLinks = [
    { name: "Background", path: "/organization/background" },
    { name: "Mission Statement", path: "/organization/mission-statement" },
    { name: "Our Ideology", path: "/organization/our-ideology" },
    { name: "The Founder", path: "/organization/the-founder" },
    { name: "The Ameer", path: "/organization/the-ameer" }
  ];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: `${title} | Tanzeem-e-Islami`,
        url: window.location.href
      }).catch(() => { });
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const { settings } = useSettings();
  const bgImage = settings?.banner_bg_image;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0a]">
      {/* ── Gorgeous Hero Header ── */}
      <div className="relative overflow-hidden bg-primary text-white pt-24 pb-20 md:pt-28 md:pb-28">
        {/* Global Banner Background Image */}
        {bgImage && (
          <>
            <div
              className="absolute inset-0 z-0 bg-contain bg-center transition-transform"
              style={{ backgroundImage: `url('${bgImage}')` }}
            />
            {/* Overlay to ensure readability on dynamic background image */}
            <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />
          </>
        )}

        {/* Ambient Overlay Patterns */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-primary" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8a84e]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[80px]" />

        {/* Arabesque geometric watermark */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-repeat bg-center"
          style={{ backgroundImage: `url('/images/pattern-arabesque.png')`, backgroundSize: '180px' }}
        />

        <div className="container mx-auto relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-normal">
              {title}
            </h1>
          </motion.div>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-emerald-100/80 mb-6 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-60 text-[#c8a84e]" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-emerald-200">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="hover:text-white transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div className="container mx-auto my-8 md:my-12">
        <div className="grid grid-cols-1 gap-6 md:gap-8 items-start">

          {/* Left / Main Column — Article Text */}
          <div className="lg:col-span-2 space-y-8">

            {/* Featured Image inside Article (Only for non-leader templates) */}
            {featuredImage && template !== "leader" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl overflow-hidden shadow-deep border border-slate-200/50 aspect-[21/9] bg-slate-100"
              >
                <img
                  src={featuredImage}
                  alt={title}
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            )}

            {/* Prose Card container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-8 md:p-6 shadow-mid3 relative overflow-hidden"
            >
              {/* Subtle Arabesque Watermark inside the card */}
              <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-repeat bg-center" style={{ backgroundImage: `url('/images/pattern-arabesque.png')` }} />

              {/* Action Toolbar */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/80 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Official Publication
                  </span>
                  <span className="hidden sm:inline-block border-l border-slate-200 dark:border-zinc-800 h-3" />
                  <span className="hidden sm:flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Updated June 2026
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-slate-100" onClick={handleShare} title="Share Link">
                    <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </Button>
                </div>
              </div>

              {/* Leader Template Centered Title & Dates */}
              {template === "leader" && (
                <div className="text-center mb-8 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-wider text-sm md:text-base">
                      {excerpt}
                    </p>
                  )}
                </div>
              )}

              {/* Page Content Renderer */}
              {cleanContent ? (
                <article
                  className="prose prose-lg prose-emerald dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-800 dark:prose-headings:text-zinc-100
                    prose-h2:text-2xl prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-3 prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-slate-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
                    prose-strong:text-slate-800 dark:prose-strong:text-zinc-100 prose-strong:font-bold
                    prose-li:text-slate-600 dark:prose-li:text-zinc-300 prose-li:mb-2
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                    prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-[#c8a84e] prose-blockquote:pl-6 prose-blockquote:text-slate-700 dark:prose-blockquote:text-zinc-300 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-zinc-900/50 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-2xl"
                >
                  {featuredImage && template === "leader" && (
                    <div className="w-full max-w-xs mx-auto md:w-auto md:max-w-[340px] md:float-left md:mr-6 md:mb-4 mb-6 rounded-3xl overflow-hidden shadow-mid border border-slate-200/50 bg-slate-100">
                      <img
                        src={featuredImage}
                        alt={title}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
                </article>
              ) : (
                <div className="text-center py-12 text-muted-foreground italic">
                  No content available for this page yet. Edit this page in the Site Manager.
                </div>
              )}
            </motion.div>

            {/* Accordion List Component */}
            {accordionItems && accordionItems.length > 0 && (
              <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-6 md:p-8 shadow-sm">
                <Accordion heading="Interactive In-Depth Explorer" items={accordionItems} />
              </div>
            )}
          </div>


        </div>
      </div>

      {/* ── Stats Section (Conditional) ── */}
      {stats && stats.length > 0 && (
        <div className="mt-16 border-t border-slate-200/50">
          <StatsGrid stats={stats} />
        </div>
      )}

      {/* ── Footer CTA Banner (Conditional) ── */}
      {ctaHeading && ctaButtonLabel && ctaButtonUrl && (
        <div className="mt-16">
          <CTABanner
            heading={ctaHeading}
            subheading={ctaSubheading || ""}
            buttonLabel={ctaButtonLabel}
            buttonUrl={ctaButtonUrl}
          />
        </div>
      )}
    </div>
  );
}
