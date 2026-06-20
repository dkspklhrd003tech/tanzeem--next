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

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0a] pb-16">
      {/* ── Gorgeous Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d5844] via-[#005031] to-[#003d25] text-white pt-24 pb-20 md:pt-28 md:pb-28">
        {/* Ambient Overlay Patterns */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8a84e]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]" />

        {/* Arabesque geometric watermark */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-repeat bg-center"
          style={{ backgroundImage: `url('/images/pattern-arabesque.png')`, backgroundSize: '180px' }}
        />

        <div className="container mx-auto px-4 relative z-10">
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

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">

          {/* Left / Main Column — Article Text */}
          <div className="lg:col-span-2 space-y-8">

            {/* Featured Image inside Article */}
            {featuredImage && (
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
              className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-6 md:p-12 shadow-mid3 relative overflow-hidden"
            >
              {/* Subtle Arabesque Watermark inside the card */}
              <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-repeat bg-center" style={{ backgroundImage: `url('/images/pattern-arabesque.png')` }} />

              {/* Action Toolbar */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/80 pb-6 mb-8 text-xs text-muted-foreground">
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
                    <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-slate-100" onClick={handlePrint} title="Print Page">
                    <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </Button>
                </div>
              </div>

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
                  dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground italic">
                  No content available for this page yet. Edit this page in the Site Manager.
                </div>
              )}
            </motion.div>

            {/* Ideology sub-cards if rendering "Our Ideology" landing page */}
            {ideologyCards && ideologyCards.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {ideologyCards.map((card, idx) => (
                  <motion.div
                    key={card.href}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                  >
                    <Link href={card.href} className="group block h-full bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-mid transition-all hover:border-primary/50">
                      <h3 className="font-bold text-lg text-primary dark:text-[#c8a84e] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        {card.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                        {card.description}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Accordion List Component */}
            {accordionItems && accordionItems.length > 0 && (
              <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-6 md:p-8 shadow-sm">
                <Accordion heading="Interactive In-Depth Explorer" items={accordionItems} />
              </div>
            )}
          </div>

          {/* Right Column — Sidebar Widgets */}
          <div className="space-y-8">

            {/* Widget 1: Related Sub-Navigation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-6 shadow-sm"
            >
              <h3 className="font-bold text-base text-slate-800 dark:text-zinc-100 mb-4 pb-3 border-b flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-primary" />
                Organizational Hub
              </h3>
              <ul className="space-y-1.5">
                {sidebarLinks.map((link) => {
                  // Check if pathname contains the link URL to highlight active subpath
                  const isActive = pathname.startsWith(link.path) || pathname === link.path || (link.path === "/organization/our-ideology" && pathname.includes("/our-ideology"));
                  return (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-primary"
                        )}
                      >
                        {link.name}
                        <ChevronRight className={cn("w-4 h-4 opacity-75", isActive ? "text-[#c8a84e]" : "text-slate-400")} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Widget 2: Platform Callout Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-[#0d5844]/5 via-[#005031]/10 to-[#003d25]/5 rounded-3xl border border-primary/10 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#c8a84e]/10 rounded-full blur-xl pointer-events-none" />
              <Shield className="w-8 h-8 text-primary dark:text-[#c8a84e] mb-3" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Establishment of Deen</h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Tanzeem-e-Islami works systematically to foster Quranic studies, purify character, and restore the prophetic model of societal change without political elections or violent means.
              </p>
            </motion.div>
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
