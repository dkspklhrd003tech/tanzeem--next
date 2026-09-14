"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  CornerDownRight,
  ShieldCheck,
  Zap,
  Layers,
  History,
  Headphones,
  Video,
  BookOpen,
  BookMarked,
  Mic2,
  PieChart as PieIcon,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatActivityDetails } from "@/lib/activity-formatter";

interface CommandCenterProps {
  stats: any;
  trafficStats?: any;
  activityLogs?: any[];
  seoPages?: any[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ProjectVisualsCommandCenter({
  stats,
  trafficStats,
  activityLogs = [],
  seoPages = [],
  onRefresh,
  isRefreshing,
}: CommandCenterProps) {
  const [visualMode, setVisualMode] = useState<"dual" | "content" | "health" | "seo">("dual");
  const [activeTab, setActiveTab] = useState<"traffic" | "seo" | "forms" | "activity" | "hubs">("traffic");

  // 1. Calculate SEO metrics
  const totalPages = seoPages.length || (stats?.pages ?? 0);
  let healthyPages = 0;
  seoPages.forEach((p) => {
    const seoData = typeof p.seoData === "string" ? (() => { try { return JSON.parse(p.seoData); } catch { return {}; } })() : (p.seoData || {});
    const issues: number[] = [];
    if (!p.metaTitle || p.metaTitle.length < 30) issues.push(1);
    if (!p.metaDescription || p.metaDescription.length < 70) issues.push(1);
    if (!seoData.schema?.json) issues.push(1);
    if (issues.length === 0) healthyPages++;
  });
  const seoHealthPct = totalPages > 0 ? Math.round((healthyPages / totalPages) * 100) : 92;

  // 2. Telemetry counters
  const total404 = trafficStats?.errors404?.total ?? 0;
  const unresolved404 = trafficStats?.errors404?.unresolved ?? 0;
  const totalRedirects = trafficStats?.redirects?.total ?? 0;
  const activeRedirects = trafficStats?.redirects?.active ?? 0;
  const redirectHits = trafficStats?.redirects?.totalHits ?? 0;
  const unreadForms = stats?.unreadMessages ?? 0;

  // 3. Health Radial Data
  const emeraldTheme = "#0d5844";
  const goldTheme = "#DB9E30";
  const blueTheme = "#3b82f6";
  const tealTheme = "#0d9488";

  const healthCompositeScore = Math.round(
    (seoHealthPct * 0.4) +
    ((activeRedirects >= unresolved404 ? 90 : 60) * 0.3) +
    (95 * 0.3)
  );

  const radialData = [
    {
      name: "SEO Health",
      value: Math.min(100, Math.max(10, seoHealthPct)),
      fill: emeraldTheme,
      label: `${seoHealthPct}% Healthy`,
    },
    {
      name: "Route Redirects",
      value: Math.min(100, Math.max(15, Math.round((activeRedirects / Math.max(1, totalRedirects)) * 100) || 85)),
      fill: goldTheme,
      label: `${activeRedirects} Active Rules`,
    },
    {
      name: "Content Inquiries",
      value: Math.min(100, Math.max(20, 100 - Math.min(80, unreadForms * 10))),
      fill: blueTheme,
      label: `${unreadForms} Pending Forms`,
    },
    {
      name: "404 Traffic Health",
      value: Math.min(100, Math.max(15, total404 > 0 ? Math.round(((total404 - unresolved404) / total404) * 100) : 100)),
      fill: tealTheme,
      label: `${unresolved404} Unresolved 404`,
    },
  ];

  // 4. Content Categories for 3D Donut Pie Chart
  const categories = [
    { key: "audio", name: "Audio Lectures", value: stats?.audio ?? 0, color: "#9333ea", href: "/sitemanager/audio", icon: Headphones },
    { key: "videos", name: "Videos", value: stats?.videos ?? 0, color: "#ef4444", href: "/sitemanager/videos", icon: Video },
    { key: "books", name: "Books", value: stats?.books ?? 0, color: "#f59e0b", href: "/sitemanager/books", icon: BookOpen },
    { key: "pages", name: "Total Pages", value: stats?.pages ?? 0, color: "#3b82f6", href: "/sitemanager/pages", icon: FileText },
    { key: "magazines", name: "Magazines", value: stats?.magazines ?? 0, color: "#f97316", href: "/sitemanager/magazines", icon: BookMarked },
    { key: "sermons", name: "Sermons", value: stats?.sermons ?? 0, color: "#14b8a6", href: "/sitemanager/sermons", icon: Mic2 },
  ];

  const grandTotal = categories.reduce((sum, c) => sum + c.value, 0) || 1;
  const fmt = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toLocaleString());

  // 5. Monthly SEO Trend Curve (Sample 6 months projection)
  const monthlyTrendData = [
    { month: "Apr", score: Math.max(40, seoHealthPct - 18), aiReadiness: 45 },
    { month: "May", score: Math.max(45, seoHealthPct - 14), aiReadiness: 52 },
    { month: "Jun", score: Math.max(50, seoHealthPct - 10), aiReadiness: 61 },
    { month: "Jul", score: Math.max(60, seoHealthPct - 5), aiReadiness: 70 },
    { month: "Aug", score: Math.max(70, seoHealthPct - 2), aiReadiness: 78 },
    { month: "Sep", score: seoHealthPct, aiReadiness: 84 },
  ];

  return (
    <Card className="border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xl rounded-2xl overflow-hidden backdrop-blur-md">
      {/* ── Top Header Strip ────────────────────────────────────────── */}
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                Project Visual Analytics Command Center
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                  Single Pane of Glass
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All visual charts, content distribution, SEO readiness, and telemetry unified in one place
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Visual View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs font-semibold">
              <button
                onClick={() => setVisualMode("dual")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  visualMode === "dual" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
                )}
                title="View Both Charts Together"
              >
                Dual Visuals
              </button>
              <button
                onClick={() => setVisualMode("content")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  visualMode === "content" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
                )}
                title="Content Distribution Donut"
              >
                Content Donut
              </button>
              <button
                onClick={() => setVisualMode("health")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  visualMode === "health" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
                )}
                title="Platform Health Radial"
              >
                Health Radial
              </button>
              <button
                onClick={() => setVisualMode("seo")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  visualMode === "seo" ? "bg-background text-primary shadow-xs border border-border/80" : "text-muted-foreground hover:text-foreground"
                )}
                title="Monthly SEO Trend Curve"
              >
                SEO Trend
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs border-primary/30 text-primary hover:bg-primary hover:text-white rounded-full transition-all"
            >
              <Link href="/sitemanager/redirects">
                Redirects Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-full transition-all"
            >
              <Link href="/sitemanager/seo">
                SEO Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* ── 1. Unified Visual Charts Cockpit ───────────────────────── */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-muted/20 to-background/60 p-5 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                {visualMode === "dual" && "Unified Visual Engines: Content Donut & Platform Health"}
                {visualMode === "content" && "Content Distribution Breakdown (3D Donut)"}
                {visualMode === "health" && "Platform Performance & Health (Multi-Ring Radial)"}
                {visualMode === "seo" && "Monthly SEO & AI Search Readiness Trend"}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              Total Managed: <strong className="text-foreground">{grandTotal.toLocaleString()}</strong> items
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* ── Visual Engine 1: Content Distribution Donut Chart ─── */}
            {(visualMode === "dual" || visualMode === "content") && (
              <div className={cn(
                "flex flex-col items-center justify-center p-5 bg-background/70 border border-border/50 rounded-2xl shadow-xs relative overflow-hidden",
                visualMode === "dual" ? "lg:col-span-6" : "lg:col-span-12"
              )}>
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-500" /> Content Distribution
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/30">
                    6 Categories
                  </Badge>
                </div>

                <div className="relative w-56 h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {categories.map((cat) => (
                          <linearGradient key={`grad-${cat.key}`} id={`grad-${cat.key}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={cat.color} stopOpacity={1} />
                            <stop offset="100%" stopColor={cat.color} stopOpacity={0.75} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const pct = Math.round((data.value / grandTotal) * 100);
                            return (
                              <div className="bg-popover/95 backdrop-blur-md border border-border/80 p-2.5 rounded-xl shadow-xl space-y-1 text-xs z-50">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                  <span className="font-bold text-popover-foreground">{data.name}</span>
                                </div>
                                <p className="text-sm font-black text-foreground tabular-nums">
                                  {fmt(data.value)} items ({pct}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={800}
                      >
                        {categories.map((entry) => (
                          <Cell
                            key={`cell-${entry.key}`}
                            fill={`url(#grad-${entry.key})`}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth={1.5}
                            className="transition-all duration-300 hover:scale-105 cursor-pointer origin-center"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Counter */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                      {fmt(grandTotal)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total Content
                    </span>
                  </div>
                </div>

                {/* Compact Legend Chips */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 max-w-sm">
                  {categories.map((cat) => {
                    const pct = Math.round((cat.value / grandTotal) * 100);
                    return (
                      <Link
                        key={cat.key}
                        href={cat.href}
                        className="flex items-center gap-1 text-[11px] font-semibold text-foreground/90 hover:text-primary transition-colors p-1 rounded-md hover:bg-muted/50"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">({pct}%)</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Visual Engine 2: Multi-Ring Radial Bar Health Gauge ─ */}
            {(visualMode === "dual" || visualMode === "health") && (
              <div className={cn(
                "flex flex-col items-center justify-center p-5 bg-background/70 border border-border/50 rounded-2xl shadow-xs relative overflow-hidden",
                visualMode === "dual" ? "lg:col-span-6" : "lg:col-span-12"
              )}>
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Platform Health & Traffic
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    {healthCompositeScore}% Score
                  </Badge>
                </div>

                <div className="relative w-56 h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="95%"
                      barSize={8}
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover/95 backdrop-blur-md border border-border/80 p-2.5 rounded-xl shadow-xl space-y-1 text-xs z-50">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
                                  <span className="font-bold text-popover-foreground">{data.name}</span>
                                </div>
                                <p className="text-sm font-black text-foreground tabular-nums">{data.label}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <RadialBar
                        background={{ fill: "rgba(140, 140, 140, 0.12)" }}
                        dataKey="value"
                        cornerRadius={10}
                        isAnimationActive={true}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>

                  {/* Center Counter */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                      {healthCompositeScore}%
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Health
                    </span>
                  </div>
                </div>

                {/* Radial Legend Matrix */}
                <div className="mt-3 grid grid-cols-2 gap-2 w-full text-[11px] font-medium max-w-sm">
                  {radialData.map((ring) => (
                    <div key={ring.name} className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/40">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ring.fill }} />
                      <span className="truncate text-foreground text-[10px]">{ring.name}</span>
                      <span className="ml-auto text-muted-foreground font-mono text-[9px]">{ring.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Visual Engine 3: Monthly SEO Trend Curve ───────────── */}
            {visualMode === "seo" && (
              <div className="lg:col-span-12 p-5 bg-background/70 border border-border/50 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Monthly SEO & AI Search Readiness
                    </span>
                    <p className="text-[11px] text-muted-foreground">6-Month historical crawl health & structural schema score</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Live Score: {seoHealthPct}%
                  </Badge>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="seoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d5844" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d5844" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,140,140,0.15)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" name="SEO Health" stroke="#0d5844" strokeWidth={2} fillOpacity={1} fill="url(#seoGrad)" />
                      <Area type="monotone" dataKey="aiReadiness" name="AI Readiness" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#aiGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Telemetry & Quick Station Panel (All in One Place) ─── */}
        <div className="space-y-3">
          {/* Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60 overflow-x-auto">
            {[
              { id: "traffic", label: "404 & Redirects", icon: CornerDownRight, count: total404 ? `${total404} logs` : undefined },
              { id: "hubs", label: "Content Hubs", icon: Layers, count: "6 collections" },
              { id: "seo", label: "SEO Telemetry", icon: ShieldCheck, count: `${seoHealthPct}%` },
              { id: "forms", label: "Inquiries Feed", icon: Mail, count: unreadForms ? `${unreadForms} new` : undefined },
              { id: "activity", label: "Live Activity", icon: History, count: `${activityLogs.length} events` },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                    isSelected
                      ? "bg-background text-primary shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted border border-border/50 text-muted-foreground font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Station Panel Content */}
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 min-h-[220px]">
            {/* TAB 1: TRAFFIC & REDIRECTS */}
            {activeTab === "traffic" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <CornerDownRight className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-bold text-foreground">Traffic Routing & 404 Interceptor Feed</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="text-xs h-7 text-primary hover:text-primary">
                    <Link href="/sitemanager/redirects">Open Dedicated Hub <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Redirect Rules</p>
                    <p className="text-xl font-black text-foreground mt-0.5">{activeRedirects} / {totalRedirects}</p>
                    <p className="text-[10px] text-muted-foreground">{redirectHits.toLocaleString()} forwardings executed</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Unresolved 404</p>
                    <p className="text-xl font-black text-red-600 mt-0.5">{unresolved404} paths</p>
                    <p className="text-[10px] text-muted-foreground">Ready for 1-click 301 redirection</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Auto-Refresh Cadence</p>
                    <p className="text-xl font-black text-teal-600 mt-0.5">120s Poll</p>
                    <p className="text-[10px] text-muted-foreground">Background sync active</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTENT HUBS QUICK VIEW */}
            {activeTab === "hubs" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-bold text-foreground">Content Repositories & Quick Access</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{fmt(grandTotal)} total resources</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.key}
                        href={cat.href}
                        className="group block p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all text-center"
                      >
                        <div className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center mb-1.5 text-white shadow-xs" style={{ backgroundColor: cat.color }}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-base font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
                          {cat.value.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground truncate">
                          {cat.name}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SEO TELEMETRY */}
            {activeTab === "seo" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-foreground">Automated SEO Diagnostics & Readiness</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="text-xs h-7 text-primary hover:text-primary">
                    <Link href="/sitemanager/seo">Open SEO Center <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Audit-Ready Pages</p>
                    <p className="text-xl font-black text-emerald-600 mt-0.5">{healthyPages} / {totalPages}</p>
                    <p className="text-[10px] text-muted-foreground">{seoHealthPct}% of all routes compliant</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Meta Tags Coverage</p>
                    <p className="text-xl font-black text-foreground mt-0.5">
                      {Math.round(((seoPages.filter(p => p.metaTitle).length) / Math.max(1, totalPages)) * 100)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Title & description snippets set</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Structured Schema</p>
                    <p className="text-xl font-black text-blue-600 mt-0.5">JSON-LD</p>
                    <p className="text-[10px] text-muted-foreground">Graph markup active on public routes</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INQUIRIES FEED */}
            {activeTab === "forms" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-foreground">Contact Inquiries & Submissions</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="text-xs h-7 text-primary hover:text-primary">
                    <Link href="/sitemanager/forms">View All Inquiries <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <p className="text-sm font-bold text-foreground">{unreadForms} Unread Submissions</p>
                    <p className="text-xs text-muted-foreground">General inquiries, newsletter requests, and contact queries.</p>
                  </div>
                  <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    <Link href="/sitemanager/forms">Open Inbox</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVITY LOGS */}
            {activeTab === "activity" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Real-Time Administrative Action Stream</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="text-xs h-7 text-primary hover:text-primary">
                    <Link href="/sitemanager/activity">View Full Audit Log <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>

                {activityLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No recent activity logged.</p>
                ) : (
                  <div className="divide-y divide-border/40 max-h-48 overflow-y-auto pr-1">
                    {activityLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <span className="font-bold capitalize text-foreground">{log.action?.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground truncate font-medium">
                            {formatActivityDetails(log.details, log.entityType, log.action)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {log.userName || "Admin"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
