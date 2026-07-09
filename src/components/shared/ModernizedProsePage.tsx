"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Share2, Printer, Bookmark, Calendar, User,
  ChevronRight, Compass, Shield, BookOpen, Anchor, MapPin
} from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";
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
  children?: React.ReactNode;
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
  ctaButtonUrl,
  children
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
  const rawBgImage = settings?.banner_bg_image;
  const bgImage = rawBgImage ? resolveMediaUrl(rawBgImage) : null;

  const textColor = settings?.banner_text_color || "#ffffff";
  const separator = settings?.banner_breadcrumb_separator || "/";
  const showBreadcrumbs = settings?.banner_show_breadcrumbs !== "false";
  const titleLoading = false;
  const displayTitle = title;

  return (
    <div className="min-h-screen bg-slate-50/50 ">
      {/* ── Gorgeous Hero Header ── */}
      <div className="relative overflow-hidden bg-primary text-white py-15 md:py-28">
        {/* Global Banner Background Image */}
        {bgImage && (
          <>
            <div
              className="absolute inset-0 z-0 bg-contain bg-center transition-transform"
              style={{ backgroundImage: `url('${bgImage}')` }}
            />
          </>
        )}

        {/* Ambient Overlay Patterns */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-primary" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8a84e]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[80px]" />

        {/* Arabesque geometric watermark */}
        <div
          className="absolute inset-0 opacity-[0.03]  pointer-events-none bg-repeat bg-center"
          style={{ backgroundImage: `url('/images/pattern-arabesque.png')`, backgroundSize: '180px' }}
        />
        <div className="container relative z-20 px-4 text-center">
          <h1
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold pb-6 drop-shadow-lg line-clamp-1",
              titleLoading && "animate-pulse",
            )}
            style={{ color: textColor }}
          >
            {displayTitle}
          </h1>

          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center justify-center gap-2 text-sm md:text-base font-medium drop-shadow-md flex-wrap">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && <span style={{ color: textColor }}>{separator}</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="opacity-80"
                      style={{ color: textColor }}
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="hover:text-emerald-200 transition-colors"
                      style={{ color: textColor }}
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div className="container mx-auto p-6 md:py-8 ">
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
            {/* Subtle Arabesque Watermark inside the card */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-repeat bg-center" style={{ backgroundImage: `url('/images/pattern-arabesque.png')` }} />

            {/* Leader Template Centered Title & Dates */}
            {template === "leader" && (
              <div className="text-center mb-6 border-b border-slate-100 ">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900  tracking-tight mb-2">
                  {title}
                </h2>
                {excerpt && (
                  <h3 className="text-center !text-emerald-700  font-bold uppercase tracking-wider text-sm md:text-base">
                    {excerpt}
                  </h3>
                )}
              </div>
            )}

            {/* Page Content Renderer */}
            {cleanContent ? (
              <article
                className="prose prose-lg prose-emerald  max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-800 
                    prose-h2:text-2xl prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-3 prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-slate-600  prose-p:leading-relaxed prose-p:mb-6
                    prose-strong:text-slate-800  prose-strong:font-bold
                    prose-li:text-slate-600  prose-li:mb-2
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                    prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-[#c8a84e] prose-blockquote:pl-6 prose-blockquote:text-slate-700  prose-blockquote:bg-slate-50  prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-2xl
                    [&>*]:[unicode-bidi:plaintext] [&>*]:text-start"
              >
                {featuredImage && template === "leader" && (
                  <div className="w-full max-w-xs mx-auto md:ml-0 md:mr-8 md:float-left md:w-[320px] md:mb-4 mb-6 rounded-3xl overflow-hidden shadow-mid border border-slate-200/50 bg-slate-100">
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
          </div>
        </div>
      </div>

      {/* ── Custom Appended Content ── */}
      {children}

      {/* ── Stats Section (Conditional) ── */}
      {
        stats && stats.length > 0 && (
          <div className="mt-10 border-t border-slate-200/50">
            <StatsGrid stats={stats} />
          </div>
        )
      }

      {/* ── Footer CTA Banner (Conditional) ── */}
      {
        ctaHeading && ctaButtonLabel && ctaButtonUrl && (
          
            <CTABanner
              heading={ctaHeading}
              subheading={ctaSubheading || ""}
              buttonLabel={ctaButtonLabel}
              buttonUrl={ctaButtonUrl}
            />
          
        )
      }
    </div>
  );
}
