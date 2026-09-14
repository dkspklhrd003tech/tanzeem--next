"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MonthlySeoAreaChart } from "@/components/admin/MonthlySeoAreaChart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function SeoCenterPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);
  const [optimizingPageId, setOptimizingPageId] = useState<string | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all pages to perform live multi-engine SEO audit
  const { data: pagesRes, isLoading: pagesLoading, mutate: refreshPages } = useSWR(
    "/api/sitemanager/pages",
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 20000 }
  );

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/sitemanager/seo/audit");
      if (!res.ok) throw new Error("Audit failed");
      const data = await res.json();
      await refreshPages();
      toast({
        title: "Audit Completed",
        description: `Audited ${data.summary?.totalPages || 0} pages. Overall Health Score: ${data.summary?.overallScore || 0}%.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Audit Error",
        description: "Failed to perform live SEO audit.",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleOptimizeAll = async () => {
    setIsOptimizingAll(true);
    try {
      const res = await fetch("/api/sitemanager/seo/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");

      await refreshPages();
      toast({
        title: "⚡ All Pages Auto-Optimized!",
        description: `Successfully synthesized and updated SEO, GEO, AEO, and Schema across ${data.updatedCount || 0} pages in real time.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: err.message || "Failed to batch optimize pages.",
      });
    } finally {
      setIsOptimizingAll(false);
    }
  };

  const handleOptimizeSingle = async (pageId: string, pageTitle: string) => {
    setOptimizingPageId(pageId);
    try {
      const res = await fetch("/api/sitemanager/seo/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");

      await refreshPages();
      toast({
        title: "Page SEO Optimized!",
        description: `"${pageTitle}" now satisfies all Meta, GEO, AEO, and JSON-LD standards.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: err.message || "Failed to optimize this page.",
      });
    } finally {
      setOptimizingPageId(null);
    }
  };

  // Fetch global SEO settings
  const { data: settingsRes, mutate: refreshSettings } = useSWR("/api/settings", fetcher);
  const [seoSettings, setSeoSettings] = useState<any>({
    global_meta_title_suffix: "| Tanzeem-e-Islami",
    global_meta_description: "Tanzeem-e-Islami Is Working To Re-establish / Re-instate Khilafah",
    og_image_default: "",
    google_analytics_id: "",
  });

  React.useEffect(() => {
    if (settingsRes?.settings?.seo) {
      setSeoSettings((prev: any) => ({ ...prev, ...settingsRes.settings.seo }));
    }
  }, [settingsRes]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "seo",
          settings: seoSettings,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast({
        title: "SEO Defaults Saved",
        description: "Global metadata defaults have been updated.",
      });
      refreshSettings();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save global SEO settings.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const pageList: any[] = pagesRes?.pages || [];
  const totalPages = pageList.length;

  let healthyPages = 0;
  let pagesWithErrors = 0;
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

    let hasTradIssue = false;
    if (!p.metaTitle || p.metaTitle.length < 30) { issues.push("Meta Title missing or too short (< 30 chars)"); hasTradIssue = true; }
    if (!p.metaDescription || p.metaDescription.length < 70) { issues.push("Meta Description missing or too short (< 70 chars)"); hasTradIssue = true; }
    if (!hasTradIssue) traditionalPassed++;

    if (p.featuredImage && !p.featuredImageAlt) {
      issues.push("Featured Image Alt Text missing");
    } else {
      altTextsPassed++;
    }

    let hasGeoAeoIssue = false;
    if (!seoData.geo?.summary || !seoData.geo?.entities) { issues.push("Generative Engine Optimization (GEO) summary unassigned"); hasGeoAeoIssue = true; }
    if (!seoData.aeo?.faq) { issues.push("Answer Engine Optimization (AEO) FAQ section missing"); hasGeoAeoIssue = true; }
    if (!hasGeoAeoIssue) aeoGeoPassed++;

    if (!seoData.schema?.json) issues.push("Dynamic JSON-LD Schema payload unassigned");
    else schemaPassed++;

    let hasTechIssue = false;
    if (!p.canonicalUrl) { issues.push("Canonical URL unassigned"); hasTechIssue = true; }
    if (!p.ogImage) { issues.push("Open Graph Share Card Image missing"); hasTechIssue = true; }
    if (!hasTechIssue) technicalPassed++;

    const pageMaxScore = 8;
    const passedCount = Math.max(0, pageMaxScore - issues.length);
    const pageScore = Math.round((passedCount / pageMaxScore) * 100);

    if (issues.length > 0) {
      pagesWithErrors++;
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

  const overallScore = totalPages > 0 ? Math.round((healthyPages / totalPages) * 100) : 100;
  const filteredIssues = issueSources.filter(
    (i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── SEO Center Hero Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/10 via-card to-background p-6 rounded-2xl border border-emerald-500/20 shadow-sm backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              SEO & AI Engine Center
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Automated search engine optimization, generative engine readiness (GEO), and schema validation across all {totalPages} pages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAudit}
            disabled={!isMounted ? false : (isAuditing || pagesLoading)}
            className="text-xs rounded-full gap-1.5 border-amber-500 text-amber-700 hover:bg-amber-500/10 hover:text-amber-600"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isMounted && (pagesLoading || isAuditing) && "animate-spin")} />
            <span>{isMounted && isAuditing ? "Auditing..." : "Audit Now"}</span>
          </Button>
          {issueSources.length > 0 && (
            <Button
              size="sm"
              onClick={handleOptimizeAll}
              disabled={!isMounted ? false : isOptimizingAll}
              className="text-xs rounded-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
            >
              <Sparkles className={cn("w-3.5 h-3.5", isMounted && isOptimizingAll && "animate-spin")} />
              <span>{isMounted && isOptimizingAll ? "Optimizing All..." : `Auto-Optimize All (${issueSources.length})`}</span>
            </Button>
          )}
          <Button asChild size="sm" className="rounded-full text-xs bg-[#0d5844] hover:bg-[#093f31] text-white">
            <Link href="/sitemanager/pages">
              Manage Pages <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Interactive Monthly Area Chart ─────────────────────────── */}
      <MonthlySeoAreaChart currentScore={overallScore} totalPages={totalPages} />

      {/* ── Category Performance Grid ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Traditional Meta SEO", pct: totalPages > 0 ? Math.round((traditionalPassed / totalPages) * 100) : 100, passed: traditionalPassed },
          { label: "Image Alt Texts", pct: totalPages > 0 ? Math.round((altTextsPassed / totalPages) * 100) : 100, passed: altTextsPassed },
          { label: "GEO & AEO Readiness", pct: totalPages > 0 ? Math.round((aeoGeoPassed / totalPages) * 100) : 100, passed: aeoGeoPassed },
          { label: "JSON-LD Schemas", pct: totalPages > 0 ? Math.round((schemaPassed / totalPages) * 100) : 100, passed: schemaPassed },
          { label: "OpenGraph & Canonical", pct: totalPages > 0 ? Math.round((technicalPassed / totalPages) * 100) : 100, passed: technicalPassed },
        ].map((cat, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-border/70 bg-card/80 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground truncate">{cat.label}</span>
              <span className={cn("font-bold", cat.pct >= 80 ? "text-primary" : "text-amber-600")}>
                {cat.pct}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", cat.pct >= 80 ? "bg-emerald-500" : "bg-amber-500")}
                style={{ width: `${cat.pct}%` }}
              />
            </div>
            <p className="text-[10px] text-foreground font-medium">
              {cat.passed} of {totalPages} Compliant
            </p>
          </div>
        ))}
      </div>

      {/* ── Audit Action Items Table ────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/80 shadow-md">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Pages Requiring SEO Attention ({issueSources.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect identified issues and apply one-click fixes directly in the page editor
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search affected pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-full"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/40 max-h-[420px] overflow-y-auto">
          {filteredIssues.map((item) => (
            <div key={item.pageId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
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
                  {item.issues.map((iss, i) => (
                    <li key={i} className="truncate">{iss}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOptimizeSingle(item.pageId, item.title)}
                  disabled={optimizingPageId === item.pageId}
                  className="text-xs rounded-full font-semibold border-emerald-600/40 text-emerald-700 hover:bg-emerald-600/10 gap-1"
                >
                  <Sparkles className={cn("w-3.5 h-3.5", optimizingPageId === item.pageId && "animate-spin")} />
                  <span>{optimizingPageId === item.pageId ? "Optimizing..." : "Quick Fix"}</span>
                </Button>
                <Button size="sm" variant="secondary" asChild className="text-xs shrink-0 rounded-full font-bold">
                  <Link href={`/sitemanager/pages/${item.pageId}/edit`}>
                    Edit Page <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {filteredIssues.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-xs font-medium">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All audited pages meet search engine indexability standards!
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Global SEO Defaults Card ────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/80 shadow-md">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Global SEO Defaults</CardTitle>
              <CardDescription className="text-xs">
                Fallback metadata automatically applied when per-page tags are not specified
              </CardDescription>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              size="sm"
              className="bg-[#0d5844] hover:bg-[#093f31] text-white rounded-full text-xs gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingSettings ? "Saving..." : "Save Defaults"}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Meta Title Suffix</Label>
            <Input
              value={seoSettings.global_meta_title_suffix || ""}
              onChange={(e) => setSeoSettings({ ...seoSettings, global_meta_title_suffix: e.target.value })}
              placeholder="| Tanzeem-e-Islami"
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Google Analytics ID</Label>
            <Input
              value={seoSettings.google_analytics_id || ""}
              onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="text-xs"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-semibold">Default Meta Description</Label>
            <Textarea
              value={seoSettings.global_meta_description || ""}
              onChange={(e) => setSeoSettings({ ...seoSettings, global_meta_description: e.target.value })}
              rows={3}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
