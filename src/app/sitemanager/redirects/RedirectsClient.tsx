"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  AlertTriangle,
  CornerDownRight,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Clock,
  Calendar,
  X,
  ArrowRight,
  Sparkles,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getRedirects,
  get404Logs,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  resolve404Log,
  delete404Log,
  convert404ToRedirect,
  getTrafficStats,
} from "@/app/actions/trafficActions";
import { validateRedirectRule, normalizeRoutePath } from "@/lib/redirect-engine";

interface RedirectsClientProps {
  initialTab?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatExactDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const ms = Date.now() - new Date(date).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 45) return "Just now";
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function RedirectsClient({ initialTab = "redirects" }: RedirectsClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"redirects" | "404">(
    initialTab === "404" ? "404" : "redirects"
  );

  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(120);

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Redirects data & filter
  const [redirects, setRedirects] = useState<any[]>([]);
  const [redirectSearch, setRedirectSearch] = useState("");
  const [redirectStatus, setRedirectStatus] = useState("all");
  const [redirectTotal, setRedirectTotal] = useState(0);

  // 404 Logs data & filter
  const [logs404, setLogs404] = useState<any[]>([]);
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("all");
  const [logTotal, setLogTotal] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRedirect, setNewRedirect] = useState({
    sourcePath: "",
    destinationPath: "",
    statusCode: 301,
    status: "active",
    notes: "",
    preserveQueryString: true,
  });

  // Convert 404 Modal
  const [convertingLog, setConvertingLog] = useState<any | null>(null);
  const [convertDestination, setConvertDestination] = useState("");
  const [convertStatusCode, setConvertStatusCode] = useState(301);
  const [convertPreserveQuery, setConvertPreserveQuery] = useState(true);

  // Live validation calculations for interactive feedback
  const createValidation = React.useMemo(() => {
    if (!newRedirect.sourcePath.trim() && !newRedirect.destinationPath.trim()) return null;
    return validateRedirectRule(
      newRedirect.sourcePath,
      newRedirect.destinationPath,
      redirects
    );
  }, [newRedirect.sourcePath, newRedirect.destinationPath, redirects]);

  const convertValidation = React.useMemo(() => {
    if (!convertingLog || !convertDestination.trim()) return null;
    return validateRedirectRule(
      convertingLog.path,
      convertDestination,
      redirects
    );
  }, [convertingLog, convertDestination, redirects]);

  // ── Tab URL synchronization via window.history.replaceState ──────────────
  const handleTabChange = (tab: "redirects" | "404") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // ── Fetch Telemetry & Records ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [statsRes, redRes, logsRes] = await Promise.all([
        getTrafficStats(),
        getRedirects({ search: redirectSearch, status: redirectStatus, limit: 50 }),
        get404Logs({ search: logSearch, status: logStatus, limit: 50 }),
      ]);
      setStats(statsRes);
      setRedirects(redRes.redirects);
      setRedirectTotal(redRes.total);
      setLogs404(logsRes.logs);
      setLogTotal(logsRes.total);
      setCountdown(120);
    } catch (err) {
      console.error("Error loading redirects data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [redirectSearch, redirectStatus, logSearch, logStatus]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 120-second countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRedirect.sourcePath || !newRedirect.destinationPath) {
      toast({ variant: "destructive", title: "Missing fields", description: "Source and destination are required." });
      return;
    }

    const validation = validateRedirectRule(newRedirect.sourcePath, newRedirect.destinationPath, redirects);
    if (!validation.valid) {
      toast({ variant: "destructive", title: "Validation Error", description: validation.error });
      return;
    }

    startTransition(async () => {
      try {
        await createRedirect({
          sourcePath: newRedirect.sourcePath,
          destinationPath: newRedirect.destinationPath,
          statusCode: newRedirect.statusCode,
          status: newRedirect.status,
          notes: newRedirect.notes,
          preserveQueryString: newRedirect.preserveQueryString,
        });
        toast({ title: "Redirect Created", description: `Rule for ${validation.normalizedSource} is now active.` });
        setShowCreateModal(false);
        setNewRedirect({
          sourcePath: "",
          destinationPath: "",
          statusCode: 301,
          status: "active",
          notes: "",
          preserveQueryString: true,
        });
        loadData();
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to create rule" });
      }
    });
  };

  const handleDeleteRedirect = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect rule?")) return;
    startTransition(async () => {
      await deleteRedirect(id);
      toast({ title: "Redirect Deleted", description: "Rule removed from traffic router." });
      loadData();
    });
  };

  const handleToggleRedirectStatus = async (item: any) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      await updateRedirect(item.id, { status: newStatus });
      toast({ title: "Status Updated", description: `Rule set to ${newStatus}.` });
      loadData();
    });
  };

  const handleResolve404 = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "resolved" ? "unresolved" : "resolved";
    startTransition(async () => {
      await resolve404Log(id, nextStatus as any);
      toast({ title: "404 Updated", description: `Marked as ${nextStatus}.` });
      loadData();
    });
  };

  const handleDelete404 = async (id: string) => {
    if (!confirm("Delete this 404 error log entry?")) return;
    startTransition(async () => {
      await delete404Log(id);
      toast({ title: "Log Deleted", description: "404 log entry removed." });
      loadData();
    });
  };

  const handleConvert404 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLog || !convertDestination) return;

    const validation = validateRedirectRule(convertingLog.path, convertDestination, redirects);
    if (!validation.valid) {
      toast({ variant: "destructive", title: "Validation Error", description: validation.error });
      return;
    }

    startTransition(async () => {
      try {
        await convert404ToRedirect({
          logId: convertingLog.id,
          destinationPath: convertDestination,
          statusCode: convertStatusCode,
          preserveQueryString: convertPreserveQuery,
        });
        toast({ title: "Redirect Created", description: `Forwarded ${convertingLog.path} to ${convertDestination}.` });
        setConvertingLog(null);
        setConvertDestination("");
        setConvertPreserveQuery(true);
        loadData();
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to convert" });
      }
    });
  };

  // Route Health Donut Data
  const healthData = [
    { name: "Active Redirects", value: stats?.redirects?.active || 0, fill: "var(--primary)", pct: stats?.healthBreakdown?.activeRedirectsPct || 0 },
    { name: "Resolved 404", value: stats?.errors404?.resolved || 0, fill: "#059669", pct: stats?.healthBreakdown?.resolved404Pct || 0 },
    { name: "Unresolved 404", value: stats?.errors404?.unresolved || 0, fill: "var(--destructive)", pct: stats?.healthBreakdown?.unresolved404Pct || 0 },
  ];
  const totalHealthCount = healthData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header Strip with 120s Auto-Refresh Badge ────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/10 via-card to-background p-6 rounded-2xl border border-primary/20 shadow-sm backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
              <CornerDownRight className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              404 Detections & URL Redirects Hub
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time traffic forwarding, 404 monitoring, 301/302 link audits and zero-loss URL migrations
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* 120s Auto-Refresh Badge */}
          <Badge
            variant="outline"
            className="text-xs py-1 px-3 rounded-full bg-background/80 border-border/80 font-mono flex items-center gap-1.5 shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Auto-refreshes in {countdown}s</span>
          </Badge>

          {/* Refresh Now Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isRefreshing}
            className="text-xs rounded-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-primary")} />
            <span>Refresh Now</span>
          </Button>

          {/* + New Redirect Rule Modal Trigger */}
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="rounded-full text-xs bg-primary hover:bg-primary text-white gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Redirect Rule</span>
          </Button>
        </div>
      </div>

      {/* ── Route Health Donut Chart & Metrics Strip ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Route Health Donut */}
        <Card className="lg:col-span-5 rounded-2xl border border-border/80 shadow-md p-5 bg-card/90">
          <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
            <span className="text-xs font-bold text-foreground">Route Traffic Health Matrix</span>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
              Live Breakdown
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover/95 p-2 rounded-lg border border-border text-xs shadow-xl space-y-0.5">
                            <span className="font-bold">{d.name}</span>
                            <p className="tabular-nums text-muted-foreground">{d.value} items ({d.pct}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {healthData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-lg font-black tabular-nums">{totalHealthCount}</span>
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">Total</span>
              </div>
            </div>

            <div className="space-y-2 flex-1 text-xs">
              {healthData.map((h) => (
                <div key={h.name} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.fill }} />
                    <span className="font-medium text-foreground truncate">{h.name}</span>
                  </div>
                  <div className="font-bold tabular-nums ml-2 flex items-center gap-1">
                    <span>{h.value}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">({h.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Quick KPI Cards */}
        <div className="lg:col-span-7 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-1">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Active Redirects</span>
            <p className="text-2xl font-black text-foreground tabular-nums">{stats?.redirects?.active || 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">{stats?.redirects?.totalHits || 0} Total Hits Forwarded</p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved 404</span>
            <p className="text-2xl font-black text-emerald-600 tabular-nums">{stats?.errors404?.resolved || 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">{stats?.errors404?.redirected || 0} Redirected to Active URLs</p>
          </div>

          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-1">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Unresolved 404</span>
            <p className="text-2xl font-black text-red-600 tabular-nums">{stats?.errors404?.unresolved || 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Awaiting redirect or fix</p>
          </div>

        </div>
      </div>

      {/* ── Main Tabbed Interface ──────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/80 shadow-lg overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 p-4 bg-muted/20 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange("redirects")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === "redirects"
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>URL Redirects ({redirectTotal})</span>
            </button>

            <button
              onClick={() => handleTabChange("404")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === "404"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>404 Detections ({logTotal})</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={activeTab === "redirects" ? "Search redirect paths..." : "Search missing 404 paths..."}
                value={activeTab === "redirects" ? redirectSearch : logSearch}
                onChange={(e) => {
                  if (activeTab === "redirects") setRedirectSearch(e.target.value);
                  else setLogSearch(e.target.value);
                }}
                className="pl-8 h-8 text-xs rounded-full"
              />
            </div>

            {activeTab === "redirects" ? (
              <select
                value={redirectStatus}
                onChange={(e) => setRedirectStatus(e.target.value)}
                className="h-8 rounded-full border border-border px-3 text-xs bg-background text-foreground font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            ) : (
              <select
                value={logStatus}
                onChange={(e) => setLogStatus(e.target.value)}
                className="h-8 rounded-full border border-border px-3 text-xs bg-background text-foreground font-semibold"
              >
                <option value="all">All 404</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
                <option value="redirected">Redirected</option>
              </select>
            )}
          </div>
        </div>

        {/* ── Table View: URL Redirects ────────────────────────────── */}
        {activeTab === "redirects" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Source Path</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Hits</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date & Live Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {redirects.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {item.sourcePath}
                      {item.notes && <p className="text-[10px] font-sans text-muted-foreground font-normal mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-3 px-4 font-mono text-primary">
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[220px]">{item.destinationPath}</span>
                        <a href={item.destinationPath} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {item.statusCode}
                        </Badge>
                        {(item.matchType === "wildcard" || item.sourcePath.includes("*")) && (
                          <Badge variant="secondary" className="text-[9px] bg-purple-500/10 text-purple-700 border border-purple-500/30 px-1 py-0">
                            Wildcard
                          </Badge>
                        )}
                        {item.preserveQueryString && (
                          <span className="text-[10px] text-blue-600 font-mono font-bold" title="Preserves Query Parameters (?ref=...)">
                            ?+
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold">
                      {item.hitCount}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleRedirectStatus(item)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors",
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        )}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">{formatExactDateTime(item.createdAt)}</span>
                        <span className="block text-[10px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRedirect(item.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {redirects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                      No redirect rules found. Click &quot;+ New Redirect Rule&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Table View: 404 Detections ───────────────────────────── */}
        {activeTab === "404" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Requested 404 Path</th>
                  <th className="py-3 px-4">Hits</th>
                  <th className="py-3 px-4">Referer / IP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date & Live Timestamp</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs404.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      <span className="text-red-600">{item.path}</span>
                      {item.redirectTo && (
                        <p className="text-[10px] font-sans text-primary font-medium flex items-center gap-1 mt-0.5">
                          <CornerDownRight className="w-2.5 h-2.5" /> Redirected to {item.redirectTo}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">
                        {item.hitCount} hits
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px] max-w-[200px] truncate">
                      <span>{item.referer || "Direct / Bookmark"}</span>
                      {item.ipAddress && <span className="block text-[9px] font-mono">{item.ipAddress}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={item.status === "unresolved" ? "destructive" : "outline"}
                        className={cn(
                          "text-[10px] capitalize font-bold",
                          item.status === "resolved" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                          item.status === "redirected" && "bg-primary/10 text-primary border-primary/30"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">{formatExactDateTime(item.updatedAt || item.createdAt)}</span>
                        <span className="block text-[10px] text-muted-foreground">{timeAgo(item.updatedAt || item.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Create 301 Redirect */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setConvertingLog(item);
                            setConvertDestination("/");
                          }}
                          className="h-7 text-[11px] px-2.5 rounded-full border-primary/30 text-primary hover:bg-teal-50 gap-1 font-bold"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Create 301</span>
                        </Button>

                        {/* Mark Resolved Toggle */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolve404(item.id, item.status)}
                          className={cn(
                            "h-7 text-[11px] px-2 rounded-full",
                            item.status === "resolved" ? "text-muted-foreground" : "text-emerald-600 hover:bg-emerald-50"
                          )}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete Record */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete404(item.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {logs404.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                      No 404 detections logged matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Modal: + New Redirect Rule ─────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="w-full max-w-lg rounded-2xl shadow-2xl border-border/80 animate-in fade-in zoom-in-95 my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-primary" />
                  New URL Redirect Rule
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure precise path mapping, wildcard routing, and cycle protection
                </CardDescription>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <form onSubmit={handleCreateRedirect}>
              <CardContent className="space-y-4 pt-4 text-xs">
                {/* Source Path */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Source Path (Old URL)</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Supports /* wildcards</span>
                  </div>
                  <Input
                    required
                    placeholder="/old-page or /blog/*"
                    value={newRedirect.sourcePath}
                    onChange={(e) => setNewRedirect({ ...newRedirect, sourcePath: e.target.value })}
                    className="text-xs font-mono rounded-xl border-border/80 h-9"
                  />
                </div>

                {/* Destination Path */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Destination Path (Target URL)</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Relative or https://</span>
                  </div>
                  <Input
                    required
                    placeholder="/new-page or /articles/* or https://..."
                    value={newRedirect.destinationPath}
                    onChange={(e) => setNewRedirect({ ...newRedirect, destinationPath: e.target.value })}
                    className="text-xs font-mono rounded-xl border-border/80 h-9"
                  />
                </div>

                {/* Live Route Simulation Strip */}
                {Boolean(newRedirect.sourcePath.trim() || newRedirect.destinationPath.trim()) && (
                  <div className={cn(
                    "p-3 rounded-xl border text-xs space-y-1.5 transition-all",
                    createValidation?.valid
                      ? "bg-primary/5 border-primary/20 text-foreground"
                      : "bg-red-500/10 border-red-500/30 text-red-700"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Live Route Simulation
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {newRedirect.statusCode}
                      </Badge>
                    </div>

                    {createValidation?.valid ? (
                      <div className="flex items-center gap-2 font-mono text-[11px] overflow-x-auto py-0.5">
                        <span className="text-muted-foreground">domain.com</span>
                        <span className="font-bold text-foreground">
                          {createValidation.matchType === "wildcard"
                            ? createValidation.normalizedSource.replace("*", "sample-slug")
                            : createValidation.normalizedSource}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-bold text-primary">
                          {createValidation.matchType === "wildcard" && createValidation.normalizedDestination.includes("*")
                            ? createValidation.normalizedDestination.replace("*", "sample-slug")
                            : createValidation.normalizedDestination}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-[11px] font-sans text-red-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{createValidation?.error}</span>
                      </div>
                    )}

                    {createValidation?.valid && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-sans pt-0.5">
                        <span>Pattern: <strong className="text-foreground capitalize">{createValidation.matchType}</strong></span>
                        <span>•</span>
                        <span>Query Strings: <strong className="text-foreground">{newRedirect.preserveQueryString ? "Preserved (?ref=...)" : "Stripped"}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Code & Status Grid with Dedicated Spacing */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Status Code</Label>
                    <select
                      value={newRedirect.statusCode}
                      onChange={(e) => setNewRedirect({ ...newRedirect, statusCode: parseInt(e.target.value, 10) })}
                      className="w-full h-9 rounded-xl border border-border/80 px-3 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-2xs"
                    >
                      <option value={301}>301 Moved Permanently (SEO Standard)</option>
                      <option value={302}>302 Temporary Redirect</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Rule Status</Label>
                    <select
                      value={newRedirect.status}
                      onChange={(e) => setNewRedirect({ ...newRedirect, status: e.target.value })}
                      className="w-full h-9 rounded-xl border border-border/80 px-3 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-2xs"
                    >
                      <option value="active">Active (Forwarding)</option>
                      <option value="inactive">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>

                {/* Preserve Query String Checkbox */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newRedirect.preserveQueryString}
                      onChange={(e) => setNewRedirect({ ...newRedirect, preserveQueryString: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-primary border-border focus:ring-primary accent-primary cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">Preserve Query Parameters</span>
                      <p className="text-[11px] text-muted-foreground">
                        Carry forward URL query strings (e.g. <code className="text-foreground font-mono">?utm_source=...</code> or <code className="text-foreground font-mono">?ref=fb</code>) to the target page.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Notes & Description (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Reason / SEO Notes</Label>
                    <span className="text-[10px] text-muted-foreground font-medium">(Optional)</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Legacy WordPress migration, 2024 sitewide URL restyle..."
                    value={newRedirect.notes}
                    onChange={(e) => setNewRedirect({ ...newRedirect, notes: e.target.value })}
                    rows={2}
                    className="text-xs rounded-xl border-border/80 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || (createValidation ? !createValidation.valid : false)}
                    size="sm"
                    className="text-xs rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xs"
                  >
                    {isPending ? "Creating..." : "Create Rule"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* ── Modal: Convert 404 to 301 Redirect ─────────────────────── */}
      {convertingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="w-full max-w-lg rounded-2xl shadow-2xl border-border/80 animate-in fade-in zoom-in-95 my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <CornerDownRight className="w-4 h-4 text-primary" />
                  Forward 404 to Active URL
                </CardTitle>
                <CardDescription className="text-xs font-mono text-red-600 font-bold">
                  {convertingLog.path}
                </CardDescription>
              </div>
              <button
                onClick={() => setConvertingLog(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <form onSubmit={handleConvert404}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Destination Path</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Relative or https://</span>
                  </div>
                  <Input
                    required
                    placeholder="/new-destination or /"
                    value={convertDestination}
                    onChange={(e) => setConvertDestination(e.target.value)}
                    className="text-xs font-mono rounded-xl border-border/80 h-9"
                  />
                </div>

                {/* Convert Live Simulation */}
                {Boolean(convertDestination.trim()) && (
                  <div className={cn(
                    "p-3 rounded-xl border text-xs space-y-1.5 transition-all",
                    convertValidation?.valid
                      ? "bg-primary/5 border-primary/20 text-foreground"
                      : "bg-red-500/10 border-red-500/30 text-red-700"
                  )}>
                    {convertValidation?.valid ? (
                      <div className="flex items-center gap-2 font-mono text-[11px] overflow-x-auto">
                        <span className="text-muted-foreground">domain.com</span>
                        <span className="font-bold text-red-600 line-through">{convertingLog.path}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-bold text-primary">{convertValidation.normalizedDestination}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-[11px] font-sans text-red-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{convertValidation?.error}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Redirect Type</Label>
                  <select
                    value={convertStatusCode}
                    onChange={(e) => setConvertStatusCode(parseInt(e.target.value, 10))}
                    className="w-full h-9 rounded-xl border border-border/80 px-3 text-xs bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-2xs"
                  >
                    <option value={301}>301 Moved Permanently (SEO Standard)</option>
                    <option value={302}>302 Temporary Redirect</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={convertPreserveQuery}
                      onChange={(e) => setConvertPreserveQuery(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary border-border focus:ring-primary accent-primary cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">Preserve Query Parameters</span>
                      <p className="text-[11px] text-muted-foreground">
                        Carry forward URL query strings from incoming 404 hits to the destination URL.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-primary">
                  Creating this rule will automatically forward future visitors and mark this 404 error log as &quot;redirected&quot;.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConvertingLog(null)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || (convertValidation ? !convertValidation.valid : false)}
                    size="sm"
                    className="text-xs rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xs"
                  >
                    {isPending ? "Applying..." : "Apply 301 Forwarding"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
