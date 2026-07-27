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
  HardDrive, Layers, Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

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
  "bg-rose-600 text-white",
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
  { key: "pages" as keyof StatsData, label: "Total Pages", icon: FileText, color: "bg-blue-500/10 text-blue-600", href: "/sitemanager/pages" },
  { key: "audio" as keyof StatsData, label: "Audio Lectures", icon: Headphones, color: "bg-purple-500/10 text-purple-600", href: "/sitemanager/audio" },
  { key: "videos" as keyof StatsData, label: "Videos", icon: Video, color: "bg-red-500/10 text-red-600", href: "/sitemanager/videos" },
  { key: "books" as keyof StatsData, label: "Books", icon: BookOpen, color: "bg-amber-500/10 text-amber-600", href: "/sitemanager/books" },
  { key: "magazines" as keyof StatsData, label: "Magazines", icon: BookMarked, color: "bg-orange-500/10 text-orange-600", href: "/sitemanager/magazines" },
  { key: "sermons" as keyof StatsData, label: "Sermons", icon: Mic2, color: "bg-teal-500/10 text-teal-600", href: "/sitemanager/sermons" },
  { key: "unreadMessages" as keyof StatsData, label: "Unread Messages", icon: Mail, color: "bg-rose-500/10 text-rose-600", href: "/sitemanager/settings" },
  { key: "disclaimerViews" as keyof StatsData, label: "Disclaimer Views", icon: EyeIcon, color: "bg-emerald-500/10 text-emerald-600", href: "/sitemanager/settings" },
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

// ─── Page Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayDate, setDisplayDate] = useState<{ greg: string; hijri: string } | null>(null);

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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshStats(), refreshActivity()]);
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

      {/* ── Global Stats ────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Plays</p>
                <div className="text-2xl font-bold text-foreground tabular-nums leading-tight mt-1">{statsLoading ? <Skeleton className="h-6 w-16" /> : fmt(stats?.globalPlays ?? 0)}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Total Downloads</p>
                <div className="text-2xl font-bold text-foreground tabular-nums leading-tight mt-1">{statsLoading ? <Skeleton className="h-6 w-16" /> : fmt(stats?.globalDownloads ?? 0)}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Download className="h-5 w-5 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Total Shares</p>
                <div className="text-2xl font-bold text-foreground tabular-nums leading-tight mt-1">{statsLoading ? <Skeleton className="h-6 w-16" /> : fmt(stats?.globalShares ?? 0)}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ── Top stat cards ─────────────────────────────────────────── */}
      <motion.div variants={item}>
        {statsLoading ? <StatsSkeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-6 gap-3">
            {TOP_CARDS.map((card) => {
              if (card.key === "disclaimerViews" && !stats?.disclaimerEnabled) return null;
              return (
                <Link key={card.key} href={card.href} className="group block">
                  <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/30 hover:bg-primary-light/80 cursor-pointer">
                    <CardContent className="p-4">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2.5", card.color)}>
                        <card.icon className="h-4 w-4" />
                      </div>
                      <p className="text-2xl font-bold text-primary tabular-nums leading-tight">{stats?.[card.key] ?? 0}</p>
                      <p className="text-md text-muted-foreground mt-0.5 group-hover:text-primary transition-colors leading-tight">{card.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm"><Link href="/sitemanager/pages"><Plus className="h-4 w-4" />Create New Page</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/sitemanager/header"><Menu className="h-4 w-4" />Manage Menu</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/" target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" />View Website</Link></Button>
        </div>
      </motion.div>

      {/* ── Content KPIs ───────────────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Content KPIs</h2>
          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            <Activity className="h-3 w-3" /> Auto-refreshes every 10s
          </span>
        </div>

        {statsLoading ? <KpiSkeleton /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Audio */}
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

            {/* Videos */}
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

            {/* Books */}
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

            {/* Magazines */}
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

            {/* Sermons */}
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
      </motion.div>

      {/* ── Activity + Recent Pages ────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <motion.div variants={item}>
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

              {/* Color legend guide */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 border-t border-border/40 text-[12px] text-foreground">
                <span className="font-medium text-foreground/70">Legend:</span>
                <span className="flex items-center gap-1" title="Pages"><span className="w-2 h-2 rounded-full bg-blue-500" />Pages</span>
                <span className="flex items-center gap-1" title="Audios"><span className="w-2 h-2 rounded-full bg-purple-500" />Audios</span>
                <span className="flex items-center gap-1" title="Videos"><span className="w-2 h-2 rounded-full bg-red-500" />Videos</span>
                <span className="flex items-center gap-1" title="Books"><span className="w-2 h-2 rounded-full bg-amber-500" />Books</span>
                <span className="flex items-center gap-1" title="Magazines"><span className="w-2 h-2 rounded-full bg-orange-500" />Magazines</span>
                <span className="flex items-center gap-1" title="Users / Login"><span className="w-2 h-2 rounded-full bg-emerald-500" />Users</span>
                <span className="flex items-center gap-1" title="Menus"><span className="w-2 h-2 rounded-full bg-teal-500" />Menus</span>
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
                          <span>{log.action.replace(/_/g, " ")} {log.entityType}</span>
                          <span className={cn("text-[10px] font-mono px-1.5 py-0.2 rounded text-white font-semibold", getEntityColor(log.entityType))}>
                            {getEntityLabel(log.entityType)}
                          </span>
                        </p>
                        {log.details && <p className="text-xs text-foreground truncate mt-0.5">{log.details}</p>}
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
        </motion.div>

        {/* Recent Pages */}
        <motion.div variants={item}>
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
        </motion.div>
      </div>

      {/* ── Charts placeholder ─────────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Page Views</CardTitle>
              <CardDescription className="text-xs">Overview — last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center bg-muted/40 rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Analytics chart</p>
                  <p className="text-xs text-muted-foreground/60">Connect an analytics provider</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4 text-primary" />Resource Downloads</CardTitle>
              <CardDescription className="text-xs">Audio, videos, books — last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center bg-muted/40 rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Download className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Download stats chart</p>
                  <p className="text-xs text-muted-foreground/60">Connect an analytics provider</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

    </motion.div>
  );
}
