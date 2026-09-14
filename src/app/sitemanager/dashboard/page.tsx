"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, Headphones, Video, BookOpen, BookMarked, Mic2,
  Image, Mail, Database, TrendingUp, Plus, Upload, Menu,
  Clock, Globe, Globe2, EyeOff, Activity, ArrowRight, RefreshCw,
  ChevronDown, ChevronUp, Play, Download, Eye as EyeIcon,
  HardDrive, Layers, Share2, ShieldAlert, ShieldCheck, Zap,
  AlertTriangle, CornerDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { ProjectVisualsCommandCenter } from "@/components/admin/ProjectVisualsCommandCenter";
import { MonthlySeoAreaChart } from "@/components/admin/MonthlySeoAreaChart";
import { formatActivityDetails } from "@/lib/activity-formatter";

// ─── Fetcher ──────────────────────────────────────────────────────────────────
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.error || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Animation variants ───────────────────────────────────────────────────────
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatsData {
  pages: number; media: number; unreadMessages: number; totalResources: number;
  audio: number; audioPlays: number; audioDownloads: number;
  videos: number; videoViews: number;
  books: number; bookDownloads: number;
  magazines: number; magazineDownloads: number;
  sermons: number; sermonsPublished: number;
  pressReleases: number; team: number; campaigns: number; locations: number;
  disclaimerViews: number; disclaimerEnabled?: boolean;
  globalPlays: number; globalDownloads: number; globalShares: number;
}
interface AudioCategory { category: string; count: number; plays: number; downloads: number; }
interface BookCategory { category: string; count: number; downloads: number; }
interface MagazineYear { year: number | string; count: number; downloads: number; }
interface MediaType { type: string; count: number; totalSizeMB: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function timeAgo(date: string | Date) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
const ENTITY_COLOR_MAP: Record<string, { bg: string; label: string }> = {
  page: { bg: "bg-blue-500", label: "Pages" },
  audio: { bg: "bg-purple-500", label: "Audios" },
  video: { bg: "bg-red-500", label: "Videos" },
  book: { bg: "bg-amber-500", label: "Books" },
  magazine: { bg: "bg-orange-500", label: "Magazines" },
  user: { bg: "bg-emerald-500", label: "Users / Auth" },
  menu: { bg: "bg-teal-500", label: "Menus" },
  menu_item: { bg: "bg-teal-500", label: "Menus" },
  media: { bg: "bg-violet-500", label: "Media" },
  setting: { bg: "bg-indigo-500", label: "Settings" },
  settings: { bg: "bg-indigo-500", label: "Settings" },
};

const USER_PALETTES = [
  "bg-emerald-600 text-white",
  "bg-blue-600 text-white",
  "bg-purple-600 text-white",
  "bg-amber-600 text-white",
  "bg-red-600 text-white",
  "bg-indigo-600 text-white",
  "bg-teal-600 text-white",
  "bg-cyan-600 text-white",
  "bg-pink-600 text-white",
  "bg-violet-600 text-white",
];

function getUserColor(log: any) {
  if (log?.badgeBg && log?.badgeText) {
    return {
      style: { backgroundColor: log.badgeBg, color: log.badgeText },
      className: "",
    };
  }
  const name = log?.userName || "";
  if (!name) return { className: "bg-slate-600 text-white" };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_PALETTES.length;
  return { className: USER_PALETTES[index] };
}

function getEntityColor(type: string) {
  const key = type?.toLowerCase() || "";
  return ENTITY_COLOR_MAP[key]?.bg ?? "bg-slate-400";
}
function getEntityLabel(type: string) {
  const key = type?.toLowerCase() || "";
  return ENTITY_COLOR_MAP[key]?.label ?? (type ? type : "System");
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-10 lg:grid-cols-12 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4">
          <Skeleton className="h-8 w-8 rounded-lg mb-2.5" />
          <Skeleton className="h-6 w-12 mb-1.5" />
          <Skeleton className="h-3 w-16" />
        </CardContent></Card>
      ))}
    </div>
  );
}
function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}><CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-5 w-32" /></div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(j => <div key={j} className="bg-muted/50 rounded-lg p-2 space-y-1"><Skeleton className="h-5 w-12 mx-auto" /><Skeleton className="h-3 w-14 mx-auto" /></div>)}
          </div>
          <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-3 w-3/5" />
        </CardContent></Card>
      ))}
    </div>
  );
}
function ActivitySkeleton() {
  return (<ul className="space-y-4">{Array.from({ length: 5 }).map((_, i) => (
    <li key={i} className="flex items-start gap-3">
      <Skeleton className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" />
      <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /><Skeleton className="h-3 w-20" /></div>
    </li>
  ))}</ul>);
}
function RecentPagesSkeleton() {
  return (<ul className="divide-y divide-border">{Array.from({ length: 5 }).map((_, i) => (
    <li key={i} className="py-3 flex items-center gap-3">
      <Skeleton className="h-4 flex-1" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-20" />
    </li>
  ))}</ul>);
}

// ─── Top-level stat cards config ─────────────────────────────────────────────
const TOP_CARDS = [
  {
    key: "pages" as any,
    label: "Total Pages",
    icon: FileText,
    color: "bg-blue-500/10 text-blue-600",
    hoverStyle: "hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-blue-500/10",
    badgeStyle: "bg-blue-500/10 text-blue-700 border-blue-500/30",
    stripColor: "bg-blue-500",
    href: "/sitemanager/pages",
  },
  {
    key: "audio" as any,
    label: "Audio Lectures",
    icon: Headphones,
    color: "bg-purple-500/10 text-purple-600",
    hoverStyle: "hover:border-purple-500/50 hover:bg-purple-500/5 hover:shadow-purple-500/10",
    badgeStyle: "bg-purple-500/10 text-purple-700 border-purple-500/30",
    stripColor: "bg-purple-500",
    href: "/sitemanager/audio",
  },
  {
    key: "videos" as any,
    label: "Videos",
    icon: Video,
    color: "bg-red-500/10 text-red-600",
    hoverStyle: "hover:border-red-500/50 hover:bg-red-500/5 hover:shadow-red-500/10",
    badgeStyle: "bg-red-500/10 text-red-700 border-red-500/30",
    stripColor: "bg-red-500",
    href: "/sitemanager/videos",
  },
  {
    key: "books" as any,
    label: "Books",
    icon: BookOpen,
    color: "bg-amber-500/10 text-amber-600",
    hoverStyle: "hover:border-amber-500/50 hover:bg-amber-500/5 hover:shadow-amber-500/10",
    badgeStyle: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    stripColor: "bg-amber-500",
    href: "/sitemanager/books",
  },
  {
    key: "magazines" as any,
    label: "Magazines",
    icon: BookMarked,
    color: "bg-orange-500/10 text-orange-600",
    hoverStyle: "hover:border-orange-500/50 hover:bg-orange-500/5 hover:shadow-orange-500/10",
    badgeStyle: "bg-orange-500/10 text-orange-700 border-orange-500/30",
    stripColor: "bg-orange-500",
    href: "/sitemanager/magazines",
  },
  {
    key: "sermons" as any,
    label: "Sermons",
    icon: Mic2,
    color: "bg-teal-500/10 text-teal-600",
    hoverStyle: "hover:border-teal-500/50 hover:bg-teal-500/5 hover:shadow-teal-500/10",
    badgeStyle: "bg-teal-500/10 text-teal-700 border-teal-500/30",
    stripColor: "bg-teal-500",
    href: "/sitemanager/sermons",
  },
  {
    key: "unreadMessages" as any,
    label: "Unread Messages",
    icon: Mail,
    color: "bg-blue-500/10 text-blue-600",
    hoverStyle: "hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-blue-500/10",
    badgeStyle: "bg-blue-500/10 text-blue-700 border-blue-500/30",
    stripColor: "bg-blue-500",
    href: "/sitemanager/forms",
  },
  {
    key: "errors404" as any,
    label: "404 Detections",
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-600",
    hoverStyle: "hover:border-red-500/50 hover:bg-red-500/5 hover:shadow-red-500/10",
    badgeStyle: "bg-red-500/10 text-red-700 border-red-500/30",
    stripColor: "bg-red-500",
    href: "/sitemanager/redirects?tab=404",
  },
  {
    key: "redirects" as any,
    label: "URL Redirects",
    icon: CornerDownRight,
    color: "bg-teal-500/10 text-teal-600",
    hoverStyle: "hover:border-teal-500/50 hover:bg-teal-500/5 hover:shadow-teal-500/10",
    badgeStyle: "bg-teal-500/10 text-teal-700 border-teal-500/30",
    stripColor: "bg-teal-500",
    href: "/sitemanager/redirects?tab=redirects",
  },
];

// ─── Sub-bar: shows a percentage bar relative to max ─────────────────────────
function SubBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Collapsible KPI card ─────────────────────────────────────────────────────
function KpiCard({
  title, icon: Icon, iconColor, metrics, rows, rowKeys, rowLabel,
}: {
  title: string;
  icon: React.ElementType<{ className?: string }>;
  iconColor: string;
  metrics: { label: string; value: number | string; icon: React.ElementType<{ className?: string }>; }[];
  rows: Record<string, any>[];
  rowKeys: { key: string; label: string; isBar?: boolean; barColor?: string }[];
  rowLabel: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const maxVal = rows.length > 0 ? Math.max(...rows.map((r) => Number(r[rowKeys[0].key]) || 0)) : 0;

  return (
    <Card className="overflow-hidden border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-card via-card to-muted/20 rounded-2xl">
      <CardContent className="p-0">
        {/* Header */}
        <div className={cn("p-4 flex items-center justify-between border-l-4 bg-muted/40 backdrop-blur-sm", iconColor.replace("text-", "border-"))}>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-inner", iconColor.replace("text-", "bg-").replace("600", "500/15"))}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-tight">{title}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{rows.length} {rowLabel}</p>
            </div>
          </div>
          <button onClick={() => setExpanded((v) => !v)} className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-muted/30 border-y border-border/50">
          {metrics.map((m, i) => (
            <div key={`${m.label}-${i}`} className="bg-background/80 backdrop-blur-md rounded-xl p-2.5 text-center border border-border/40 shadow-2xs">
              <p className="text-lg font-black text-foreground tabular-nums tracking-tight">{typeof m.value === "number" ? fmt(m.value) : m.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                <m.icon className="h-3 w-3 text-primary" />{m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Breakdown rows */}
        {expanded && rows.length > 0 && (
          <div className="divide-y divide-border/40 max-h-[416px] overflow-y-auto pr-0.5">
            {rows.map((row, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors group">
                <span className="text-xs text-foreground font-semibold flex-1 truncate min-w-0 group-hover:text-primary transition-colors">{row.category ?? row.year ?? row.type ?? "-"}</span>
                {rowKeys.map((rk) => (
                  <div key={rk.key} className="text-right shrink-0 min-w-[48px]">
                    {rk.isBar ? (
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground font-medium">{rk.label}</span>
                          <span className="text-[11px] font-bold tabular-nums text-foreground">{fmt(Number(row[rk.key]))}</span>
                        </div>
                        <SubBar value={Number(row[rk.key])} max={maxVal} color={rk.barColor ?? "bg-primary"} />
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold tabular-nums text-foreground">{fmt(Number(row[rk.key]))}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{rk.label}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {expanded && rows.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6 font-medium">No category breakdown data</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SEO Center Dashboard Summary Widget ─────────────────────────
function SeoCenterDashboardWidget() {
  const { data: pagesRes, isLoading } = useSWR("/api/sitemanager/pages", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 15000,
  });

  const pageList: any[] = pagesRes?.pages || [];

  let totalPages = pageList.length;
  let healthyPages = 0;
  let pagesWithErrors = 0;
  let totalIssues = 0;
  let traditionalPassed = 0;
  let altTextsPassed = 0;
  let aeoGeoPassed = 0;
  let schemaPassed = 0;
  let technicalPassed = 0;

  const issueSources: Array<{
    pageId: string;
    title: string;
    slug: string;
    score: number;
    issues: string[];
    criticalCount: number;
  }> = [];

  pageList.forEach((p) => {
    const issues: string[] = [];
    const seoData = typeof p.seoData === "string" ? (() => { try { return JSON.parse(p.seoData); } catch { return {}; } })() : (p.seoData || {});

    // 1. Traditional SEO
    let hasTradIssue = false;
    if (!p.metaTitle || p.metaTitle.length < 30) { issues.push("Meta Title missing or too short (< 30 chars)"); hasTradIssue = true; }
    if (!p.metaDescription || p.metaDescription.length < 70) { issues.push("Meta Description missing or too short (< 70 chars)"); hasTradIssue = true; }
    if (!hasTradIssue) traditionalPassed++;

    // 2. Alt Text & Images
    if (p.featuredImage && !p.featuredImageAlt) {
      issues.push("Featured Image Alt Text missing");
    } else {
      altTextsPassed++;
    }

    // 3. GEO & AEO (Generative & Answer Engine Readiness)
    let hasGeoAeoIssue = false;
    if (!seoData.geo?.summary || !seoData.geo?.entities) { issues.push("Generative Engine Optimization (GEO) summary unassigned"); hasGeoAeoIssue = true; }
    if (!seoData.aeo?.faq) { issues.push("Answer Engine Optimization (AEO) FAQ section missing"); hasGeoAeoIssue = true; }
    if (!hasGeoAeoIssue) aeoGeoPassed++;

    // 4. Schema
    if (!seoData.schema?.json) issues.push("Dynamic JSON-LD Schema payload unassigned");
    else schemaPassed++;

    // 5. Technical SEO & Open Graph
    let hasTechIssue = false;
    if (!p.canonicalUrl) { issues.push("Canonical URL unassigned"); hasTechIssue = true; }
    if (!p.ogImage) { issues.push("Open Graph Share Card Image missing"); hasTechIssue = true; }
    if (!hasTechIssue) technicalPassed++;

    // Page Score calculation
    const pageMaxScore = 8;
    const passedCount = Math.max(0, pageMaxScore - issues.length);
    const pageScore = Math.round((passedCount / pageMaxScore) * 100);

    if (issues.length > 0) {
      pagesWithErrors++;
      totalIssues += issues.length;
      issueSources.push({
        pageId: p.id,
        title: p.title || p.slug,
        slug: p.slug,
        score: pageScore,
        issues,
        criticalCount: issues.length,
      });
    } else {
      healthyPages++;
    }
  });

  // Calculate Site SEO Health Scores
  const overallScore = totalPages > 0 ? Math.round((healthyPages / totalPages) * 100) : 100;
  const traditionalPct = totalPages > 0 ? Math.round((traditionalPassed / totalPages) * 100) : 100;
  const altTextsPct = totalPages > 0 ? Math.round((altTextsPassed / totalPages) * 100) : 100;
  const aeoGeoPct = totalPages > 0 ? Math.round((aeoGeoPassed / totalPages) * 100) : 100;
  const schemaPct = totalPages > 0 ? Math.round((schemaPassed / totalPages) * 100) : 100;
  const technicalPct = totalPages > 0 ? Math.round((technicalPassed / totalPages) * 100) : 100;

  if (isLoading) {
    return (
      <Card className="border border-border/80 shadow-lg p-6 bg-card rounded-2xl space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-emerald-500/20 shadow-xl bg-gradient-to-br from-card via-card to-emerald-950/5 rounded-2xl">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                SEO Center — Global July-2026 Audit Dashboard
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Next-Gen Intelligence
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time automated diagnostic health & AI search engine indexability across all {totalPages} pages
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="text-xs text-primary border-primary/30 hover:bg-primary hover:text-white rounded-full">
            <Link href="/sitemanager/pages">
              Manage All Pages <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Top 4 July-2026 KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Cinematic Circled Rating Gauge */}
          <div className="bg-background backdrop-blur-md border border-border/60 rounded-2xl p-5 flex flex-col items-center justify-center relative shadow-inner">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-primary-light" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * overallScore) / 100}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    overallScore >= 80 ? "text-emerald-500" : overallScore >= 50 ? "text-amber-500" : "text-red-500"
                  )}
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black tabular-nums tracking-tighter text-primary">{overallScore}%</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Health</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-center mt-2 text-foreground">
              {overallScore >= 80 ? "Optimal Search Readiness" : "Action Required"}
            </p>
            <p className="text-[12px] text-primary/80 text-center">
              {healthyPages} of {totalPages} Pages 100% Passed
            </p>
          </div>

          {/* 2. Category Performance Bars */}
          <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-5 space-y-3 shadow-inner flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Core Category Breakdown
            </h4>

            {/* Traditional SEO Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Traditional Meta SEO</span>
                <span className="tabular-nums text-primary">{traditionalPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${traditionalPct}%` }} />
              </div>
            </div>

            {/* Alt Text Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Image Accessibility (Alt Text)</span>
                <span className="tabular-nums text-foreground">{altTextsPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: `${altTextsPct}%` }} />
              </div>
            </div>

            {/* Technical SEO Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Technical & Social Sharing</span>
                <span className="tabular-nums text-foreground">{technicalPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${technicalPct}%` }} />
              </div>
            </div>
          </div>

          {/* 3. Next-Gen July-2026 AI Search Engine Readiness */}
          <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-5 space-y-3 shadow-inner flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-500" /> July-2026 AI Engine Readiness
            </h4>

            {/* GEO Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Generative AI (ChatGPT/Perplexity)</span>
                <span className="tabular-nums text-foreground">{aeoGeoPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${aeoGeoPct}%` }} />
              </div>
            </div>

            {/* AEO Voice Search Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Voice Search & Answer Engines (AEO)</span>
                <span className="tabular-nums text-foreground">{aeoGeoPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full transition-all duration-700" style={{ width: `${aeoGeoPct}%` }} />
              </div>
            </div>

            {/* Schema Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>JSON-LD Knowledge Graph</span>
                <span className="tabular-nums text-foreground">{schemaPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${schemaPct}%` }} />
              </div>
            </div>
          </div>

          {/* 4. Actionable Diagnostics Summary */}
          <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-5 shadow-inner flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Diagnostics Summary
            </h4>

            <div className="grid grid-cols-2 gap-2 my-1">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-xl font-black text-red-600 tabular-nums">{pagesWithErrors}</span>
                <p className="text-[10px] font-semibold text-red-700">Pages Needing Fixes</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <span className="text-xl font-black text-amber-600 tabular-nums">{totalIssues}</span>
                <p className="text-[10px] font-semibold text-amber-700">Total Action Items</p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Automated multi-layer scanner detects missing titles, schemas, alt tags, and Open Graph card data.
            </p>
          </div>
        </div>


        {/* Real-Time Issue Sources List */}
        {
          issueSources.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                  Pages Requiring SEO Attention ({issueSources.length})
                </h4>
                <span className="text-xs text-muted-foreground">Exact source locations listed below</span>
              </div>

              <div className="divide-y divide-border/40 border border-border/60 rounded-2xl bg-background/50 overflow-hidden max-h-72 overflow-y-auto">
                {issueSources.map((item) => (
                  <div key={item.pageId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-500/5 transition-colors">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">{item.title}</span>
                        <Badge variant="outline" className="text-[10px] font-mono bg-muted/50">
                          /{item.slug}
                        </Badge>
                        <Badge variant="destructive" className="text-[10px] px-2 py-0">
                          {item.score}% Score
                        </Badge>
                      </div>
                      <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                        {item.issues.slice(0, 2).map((iss, i) => (
                          <li key={i} className="truncate">{iss}</li>
                        ))}
                        {item.issues.length > 2 && (
                          <li className="font-semibold text-muted-foreground list-none pl-4">
                            + {item.issues.length - 2} more action item(s)
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button size="sm" variant="secondary" asChild className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs shrink-0 rounded-full font-bold">
                      <Link href={`/sitemanager/pages/${item.pageId}/edit`}>
                        Open SEO Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayDate, setDisplayDate] = useState<{ greg: string; hijri: string } | null>(null);
  const [stationTab, setStationTab] = useState<"content" | "seo" | "activity" | "actions">("content");

  // 1. Fetch site settings for Hijri offset calculation
  const { data: settingsRes } = useSWR("/api/settings", fetcher, { revalidateOnFocus: false });

  // Compute Hijri Date exact to frontend header
  useEffect(() => {
    try {
      const rawSettings = settingsRes?.raw || [];
      const offsetSetting = rawSettings.find((s: any) => s.key === "hijri_offset");
      const offset = parseInt(offsetSetting?.value || "0", 10) || 0;

      const gregDate = new Date();
      const gregStr = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(gregDate);

      const hijriDate = new Date();
      hijriDate.setDate(hijriDate.getDate() + offset);

      const hijriParts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }).formatToParts(hijriDate);

      let hijriDay = "";
      let hijriMonthNum = "";
      let hijriYear = "";

      for (const part of hijriParts) {
        if (part.type === "day") hijriDay = part.value;
        if (part.type === "month") hijriMonthNum = part.value;
        if (part.type === "year") hijriYear = part.value;
      }

      const hijriMonthNamesUr = [
        "محرم", "صفر", "ربیع الاول", "ربیع الثانی",
        "جمادی الاول", "جمادی الثانی", "رجب", "شعبان",
        "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ"
      ];

      const toUrduNumerals = (n: string) => n.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
      const monthIdx = parseInt(hijriMonthNum, 10) - 1;
      const hijriMonthName = hijriMonthNamesUr[monthIdx] || "ذوالحجہ";
      const hijriStr = `${hijriMonthName} ${toUrduNumerals(hijriDay)}، ${toUrduNumerals(hijriYear)}`;

      setDisplayDate({ greg: gregStr, hijri: hijriStr });
    } catch (e) {
      console.error("Error calculating Hijri date:", e);
    }
  }, [settingsRes]);

  const { data: statsData, isLoading: statsLoading, mutate: refreshStats } = useSWR(
    "/api/sitemanager/dashboard/stats",
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 10000, revalidateOnReconnect: true, dedupingInterval: 2000 }
  );
  const { data: activityData, isLoading: activityLoading, mutate: refreshActivity } = useSWR(
    "/api/sitemanager/activity?limit=10",
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 10000, revalidateOnReconnect: true, dedupingInterval: 2000 }
  );
  const { data: trafficData, mutate: refreshTraffic } = useSWR(
    "/api/sitemanager/traffic/stats",
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 10000, revalidateOnReconnect: true, dedupingInterval: 2000 }
  );
  const { data: pagesData, mutate: refreshPages } = useSWR(
    "/api/sitemanager/pages",
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 20000, dedupingInterval: 5000 }
  );

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshStats(), refreshActivity(), refreshTraffic(), refreshPages()]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const stats: StatsData | null = statsData?.stats ?? null;
  const recentPages: any[] = statsData?.recentPages ?? [];
  const activity: any[] = activityData?.activity ?? [];
  const audioByCategory: AudioCategory[] = statsData?.audioByCategory ?? [];
  const booksByCategory: BookCategory[] = statsData?.booksByCategory ?? [];
  const videosByCategory: any[] = statsData?.videosByCategory ?? [];
  const sermonsByCategory: any[] = statsData?.sermonsByCategory ?? [];
  const magazinesByYear: MagazineYear[] = statsData?.magazinesByYear ?? [];
  const mediaByType: MediaType[] = statsData?.mediaByType ?? [];

  const totalContent = (stats?.audio ?? 0) + (stats?.videos ?? 0) + (stats?.books ?? 0) + (stats?.pages ?? 0) + (stats?.magazines ?? 0) + (stats?.sermons ?? 0);
  const totalPlays = stats?.globalPlays ?? 0;
  const totalDownloads = stats?.globalDownloads ?? 0;
  const seoHealthPct = pagesData?.pages ? Math.round((pagesData.pages.filter((p: any) => !p.seoData || p.metaTitle).length / Math.max(1, pagesData.pages.length)) * 100) : 92;
  const activeRedirects = trafficData?.redirects?.active ?? 0;
  const totalRedirects = trafficData?.redirects?.total ?? 0;
  const unresolved404 = trafficData?.errors404?.unresolved ?? 0;
  const unreadMessages = stats?.unreadMessages ?? 0;

  const greeting = "Welcome To Tanzeem-e-Islami";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">

      {/* ── Welcome Header ────────────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent p-5 rounded-2xl border border-primary/20 backdrop-blur-md shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {greeting},{" "}
              <span className="text-primary font-bold">
                {user?.name?.split(" ")[0] ?? "Admin"}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-foreground font-medium">
              <span>{displayDate?.greg || new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
              {displayDate?.hijri && (
                <>
                  <span className="text-[#000000]">•</span>
                  <span className="text-primary font-semibold font-urdu text-lg" dir="rtl">
                    {displayDate.hijri}
                  </span>
                </>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="self-start sm:self-auto text-primary border-primary/30 hover:bg-primary hover:text-white rounded-full transition-all duration-300 shadow-sm gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-emerald-400")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Top Executive KPI Metric Strip ───────────────────────── */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Content */}
          <Card className="p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all shadow-2xs hover:shadow-md group">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-600 mb-1">
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Total Content</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-600 border-purple-500/30">6 Hubs</Badge>
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums group-hover:text-purple-600 transition-colors">
              {statsLoading ? <Skeleton className="h-7 w-16" /> : fmt(totalContent)}
            </div>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">Audios, Videos, Books...</p>
          </Card>

          {/* Card 2: Total Plays */}
          <Card className="p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all shadow-2xs hover:shadow-md group">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-600 mb-1">
              <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Total Plays</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30">Stream</Badge>
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums group-hover:text-blue-600 transition-colors">
              {statsLoading ? <Skeleton className="h-7 w-16" /> : fmt(totalPlays)}
            </div>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">Media playback interactions</p>
          </Card>

          {/* Card 3: Downloads */}
          <Card className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all shadow-2xs hover:shadow-md group">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 mb-1">
              <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Downloads</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Offline</Badge>
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums group-hover:text-emerald-600 transition-colors">
              {statsLoading ? <Skeleton className="h-7 w-16" /> : fmt(totalDownloads)}
            </div>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">Books & magazine files</p>
          </Card>

          {/* Card 4: SEO Index */}
          <Link href="/sitemanager/seo" className="group block">
            <Card className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all shadow-2xs hover:shadow-md h-full">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-600 mb-1">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> SEO Index</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 border-amber-500/30">{seoHealthPct}%</Badge>
              </div>
              <div className="text-2xl font-black text-foreground tabular-nums group-hover:text-amber-600 transition-colors">
                {seoHealthPct}%
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">Audit compliance score</p>
            </Card>
          </Link>

          {/* Card 5: 404 & Redirects */}
          <Link href="/sitemanager/redirects" className="group block">
            <Card className="p-3.5 rounded-2xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 hover:border-teal-500/40 transition-all shadow-2xs hover:shadow-md h-full">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-600 mb-1">
                <span className="flex items-center gap-1.5"><CornerDownRight className="w-3.5 h-3.5" /> Traffic Hub</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-teal-500/10 text-teal-600 border-teal-500/30">{activeRedirects} Act</Badge>
              </div>
              <div className="text-2xl font-black text-foreground tabular-nums group-hover:text-teal-600 transition-colors">
                {totalRedirects} <span className="text-xs font-bold text-red-500 ml-1">({unresolved404} err)</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">301 rules & error monitor</p>
            </Card>
          </Link>

          {/* Card 6: Form Inquiries */}
          <Link href="/sitemanager/forms" className="group block">
            <Card className="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all shadow-2xs hover:shadow-md h-full">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 mb-1">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Inquiries</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-indigo-500/10 text-indigo-600 border-indigo-500/30">{unreadMessages} New</Badge>
              </div>
              <div className="text-2xl font-black text-foreground tabular-nums group-hover:text-indigo-600 transition-colors">
                {unreadMessages}
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">Contact submissions</p>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* ── Project Visuals Command Center (Single Pane of Glass Visual Cockpit) ─── */}
      <motion.div variants={item}>
        <ProjectVisualsCommandCenter
          stats={stats}
          trafficStats={trafficData}
          activityLogs={activity}
          seoPages={pagesData?.pages || []}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />
      </motion.div>

      {/* ── Consolidated Dashboard Station (Zero Wandering, Zero Scrolling) ── */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-2xl border border-border/70">
          <div className="flex items-center gap-1.5 overflow-x-auto p-0.5">
            <button
              onClick={() => setStationTab("content")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                stationTab === "content" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-3.5 h-3.5" /> Content Collections (5)
            </button>
            <button
              onClick={() => setStationTab("seo")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                stationTab === "seo" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> SEO Audit & Diagnostics
            </button>
            <button
              onClick={() => setStationTab("activity")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                stationTab === "activity" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className="w-3.5 h-3.5" /> Activity & Pages
            </button>
            <button
              onClick={() => setStationTab("actions")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                stationTab === "actions" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-3.5 h-3.5" /> Quick Actions
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Station Control</span>
          </div>
        </div>

        {/* TAB 1: CONTENT COLLECTIONS */}
        {stationTab === "content" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <KpiCard
              title="Audio Lectures"
              icon={Headphones}
              iconColor="text-purple-600"
              metrics={[
                { label: "Total", value: stats?.audio ?? 0, icon: Layers },
                { label: "Plays", value: stats?.audioPlays ?? 0, icon: Play },
                { label: "Downloads", value: stats?.audioDownloads ?? 0, icon: Download },
              ]}
              rows={audioByCategory}
              rowLabel="categories"
              rowKeys={[
                { key: "count", label: "Items", isBar: true, barColor: "bg-purple-500" },
                { key: "downloads", label: "DL" },
              ]}
            />
            <KpiCard
              title="Videos"
              icon={Video}
              iconColor="text-red-600"
              metrics={[
                { label: "Total", value: stats?.videos ?? 0, icon: Layers },
                { label: "Views", value: stats?.videoViews ?? 0, icon: EyeIcon },
                { label: "—", value: "—", icon: Activity },
              ]}
              rows={videosByCategory}
              rowLabel="categories"
              rowKeys={[
                { key: "count", label: "Videos", isBar: true, barColor: "bg-red-500" },
                { key: "views", label: "Views" },
              ]}
            />
            <KpiCard
              title="Books"
              icon={BookOpen}
              iconColor="text-amber-600"
              metrics={[
                { label: "Total", value: stats?.books ?? 0, icon: Layers },
                { label: "Downloads", value: stats?.bookDownloads ?? 0, icon: Download },
                { label: "—", value: "—", icon: Activity },
              ]}
              rows={booksByCategory}
              rowLabel="categories"
              rowKeys={[
                { key: "count", label: "Books", isBar: true, barColor: "bg-amber-500" },
                { key: "downloads", label: "DL" },
              ]}
            />
            <KpiCard
              title="Magazines"
              icon={BookMarked}
              iconColor="text-orange-600"
              metrics={[
                { label: "Total", value: stats?.magazines ?? 0, icon: Layers },
                { label: "Downloads", value: stats?.magazineDownloads ?? 0, icon: Download },
                { label: "—", value: "—", icon: Activity },
              ]}
              rows={magazinesByYear}
              rowLabel="years"
              rowKeys={[
                { key: "count", label: "Issues", isBar: true, barColor: "bg-orange-500" },
                { key: "downloads", label: "DL" },
              ]}
            />
            <KpiCard
              title="Sermons"
              icon={Mic2}
              iconColor="text-teal-600"
              metrics={[
                { label: "Total", value: stats?.sermons ?? 0, icon: Layers },
                { label: "Published", value: stats?.sermonsPublished ?? 0, icon: Globe2 },
                { label: "Drafts", value: (stats?.sermons ?? 0) - (stats?.sermonsPublished ?? 0), icon: EyeOff },
              ]}
              rows={sermonsByCategory}
              rowLabel="categories"
              rowKeys={[
                { key: "count", label: "Sermons", isBar: true, barColor: "bg-teal-500" },
                { key: "plays", label: "Plays" },
              ]}
            />
          </div>
        )}

        {/* TAB 2: SEO AUDIT & DIAGNOSTICS */}
        {stationTab === "seo" && (
          <div className="space-y-6">
            <SeoCenterDashboardWidget />
            <MonthlySeoAreaChart
              currentScore={pagesData?.pages ? Math.round((pagesData.pages.filter((p: any) => !p.seoData || p.metaTitle).length / Math.max(1, pagesData.pages.length)) * 100) : 92}
              totalPages={pagesData?.pages?.length || stats?.pages || 24}
            />
          </div>
        )}

        {/* TAB 3: ACTIVITY & RECENT PAGES */}
        {stationTab === "activity" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Recent Activity</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Last 10 admin actions — real-time feed</CardDescription>
                  </div>
                  <Link href="/sitemanager/activity" className="text-sm px-3 py-2 font-semibold bg-primary text-white hover:bg-primary-light hover:text-primary hover:border hover:border-primary/70 rounded-full flex items-center gap-0.5">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {activityLoading ? <ActivitySkeleton /> : activity.length === 0 ? (
                  <EmptyState icon={Activity} title="No activity yet" description="Admin actions will appear here." className="py-8" />
                ) : (
                  <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {activity.map((log: any) => (
                      <li key={log.id} className="flex items-start gap-3 p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                        <span
                          className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-2 ring-background shadow-sm", getEntityColor(log.entityType))}
                          title={`Entity Type: ${getEntityLabel(log.entityType)}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium capitalize flex items-center gap-2">
                            <span>{log.action?.replace(/_/g, " ")} {log.entityType}</span>
                            <span className={cn("text-[10px] font-mono px-1.5 py-0.2 rounded text-white font-semibold", getEntityColor(log.entityType))}>
                              {getEntityLabel(log.entityType)}
                            </span>
                          </p>
                          {log.details && (
                            <p className="text-xs text-foreground truncate mt-0.5">
                              {formatActivityDetails(log.details, log.entityType, log.action)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-foreground capitalize flex items-center gap-1"><Clock className="h-3 w-3 text-foreground" />{timeAgo(log.createdAt)}</span>
                            {log.userName && (
                              <span className="text-[12px] text-muted-foreground font-medium flex items-center gap-1">
                                By{" "}
                                <span
                                  style={getUserColor(log).style}
                                  className={cn("px-1.5 py-0.5 rounded text-[11px] font-semibold shadow-xs", getUserColor(log).className)}
                                >
                                  {log.userName}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Recent Pages */}
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Recent Pages</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Last 5 edited pages</CardDescription>
                  </div>
                  <Link href="/sitemanager/pages" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    All pages <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? <RecentPagesSkeleton /> : recentPages.length === 0 ? (
                  <EmptyState icon={FileText} title="No pages yet" description="Create your first page to get started." actionLabel="Create Page" actionHref="/sitemanager/pages" className="py-8" />
                ) : (
                  <ul className="divide-y divide-border">
                    {recentPages.map((page: any) => (
                      <li key={page.id} className="py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
                          <p className="text-[11px] text-muted-foreground/70 font-mono truncate">/{page.slug}</p>
                        </div>
                        <Badge variant={page.isPublished ? "default" : "outline"} className={cn("shrink-0 text-[10px] gap-1", page.isPublished ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "text-muted-foreground")}>
                          {page.isPublished ? <><Globe2 className="h-2.5 w-2.5" />Published</> : <><EyeOff className="h-2.5 w-2.5" />Draft</>}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground/70 shrink-0 hidden sm:inline">{formatDate(page.updatedAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: QUICK ACTIONS */}
        {stationTab === "actions" && (
          <Card className="p-6 rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Site Manager Shortcuts & Tooling
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Button asChild size="sm"><Link href="/sitemanager/pages"><Plus className="h-4 w-4 mr-1" />Create New Page</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/sitemanager/header"><Menu className="h-4 w-4 mr-1" />Manage Menu</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/sitemanager/seo"><ShieldCheck className="h-4 w-4 mr-1" />Open SEO Center</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/sitemanager/redirects"><CornerDownRight className="h-4 w-4 mr-1" />Manage 404 & Redirects</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/" target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 mr-1" />View Live Website</Link></Button>
            </div>
          </Card>
        )}
      </motion.div>

    </motion.div>
  );
}
