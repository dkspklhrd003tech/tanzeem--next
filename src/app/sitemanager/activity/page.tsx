"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Activity, Clock, ShieldAlert, FileText, User, ShieldCheck, Database, Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function timeAgo(date: string | Date) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getEntityColor(type: string) {
  const map: Record<string, string> = { 
    page: "bg-blue-500", 
    audio: "bg-purple-500", 
    video: "bg-red-500", 
    book: "bg-amber-500", 
    magazine: "bg-orange-500", 
    user: "bg-green-500", 
    media: "bg-violet-500",
    auth: "bg-emerald-500"
  };
  return map[type?.toLowerCase()] ?? "bg-primary";
}

export default function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  const { data, isLoading } = useSWR("/api/sitemanager/activity?limit=1000", fetcher, {
    revalidateOnFocus: true,
  });

  const logs: any[] = data?.activity ?? [];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = search.toLowerCase() === "" || 
        log.details?.toLowerCase().includes(search.toLowerCase()) || 
        log.userName?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase());
        
      const matchEntity = entityFilter === "all" || log.entityType?.toLowerCase() === entityFilter.toLowerCase();
      
      return matchSearch && matchEntity;
    });
  }, [logs, search, entityFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 text-foreground bg-background rounded-xl border border-border shadow-2xl relative overflow-hidden">
      {/* Ambient decorative glowing spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#0d5844]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-slate-300/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Activity Logs</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Detailed chronological record of all administrative actions and system events.
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0d5844]/20 border border-[#0d5844]/30 text-primary font-bold text-[10px]">
              {logs.length} entries
            </span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by action, user, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-9 bg-background border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:border-emerald-500/40 focus:ring-emerald-500/10 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48 bg-background border-input text-foreground rounded-xl focus:border-emerald-500/40 hover:bg-accent">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Entities" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground rounded-xl">
            <SelectItem value="all" className="focus:bg-primary focus:text-emerald-700 font-medium">All Entities</SelectItem>
            <SelectItem value="page" className="focus:bg-primary focus:text-emerald-700 font-medium">Pages</SelectItem>
            <SelectItem value="video" className="focus:bg-primary focus:text-emerald-700 font-medium">Videos</SelectItem>
            <SelectItem value="audio" className="focus:bg-primary focus:text-emerald-700 font-medium">Audios</SelectItem>
            <SelectItem value="book" className="focus:bg-primary focus:text-emerald-700 font-medium">Books</SelectItem>
            <SelectItem value="user" className="focus:bg-primary focus:text-emerald-700 font-medium">Users</SelectItem>
            <SelectItem value="auth" className="focus:bg-primary focus:text-emerald-700 font-medium">Authentication</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Logs Table Container */}
      <Card className="relative z-10 bg-card backdrop-blur-md border border-border shadow-2xl overflow-hidden rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-900">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 bg-muted">
                  <Skeleton className="h-3 w-3 rounded-full bg-muted" />
                  <Skeleton className="h-5 w-48 bg-muted" />
                  <Skeleton className="h-4 w-32 bg-muted hidden sm:block" />
                  <Skeleton className="h-4 flex-1 bg-muted hidden md:block" />
                  <Skeleton className="h-4 w-24 bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity found"
              description={search || entityFilter !== "all" ? "Try adjusting your filters or search query." : "No administrative actions have been logged yet."}
              className="py-20 text-foreground"
            />
          ) : (
            <div className="overflow-x-auto">
              <div className="flex items-center gap-4 px-6 py-3.5 bg-muted border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest min-w-[900px]">
                <span className="w-10 text-center">Type</span>
                <span className="w-56">Action</span>
                <span className="w-48">User</span>
                <span className="flex-1">Details</span>
                <span className="w-32">IP Address</span>
                <span className="w-36 text-right pr-4">Time</span>
              </div>

              <div className="divide-y divide-slate-900/50 min-w-[900px]">
                {filteredLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 px-6 py-3.5 transition-all duration-300 hover:bg-accent/50 group border-l-2 border-transparent hover:border-l-primary/50"
                  >
                    {/* Entity Color Indicator */}
                    <div className="w-10 flex justify-center shrink-0">
                      <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", getEntityColor(log.entityType))} title={log.entityType} />
                    </div>

                    {/* Action & Entity */}
                    <div className="w-56 min-w-0">
                      <p className="text-sm font-bold text-foreground capitalize flex items-center gap-1.5">
                        {log.action.replace(/_/g, " ")} 
                        {log.entityType && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono lowercase">{log.entityType}</span>}
                      </p>
                      {log.entityId && (
                        <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">ID: {log.entityId}</p>
                      )}
                    </div>

                    {/* User */}
                    <div className="w-48 flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {log.userAvatar ? (
                          <img src={log.userAvatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{log.userName || "System"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{log.userEmail || "System Event"}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium break-words max-w-[400px]">
                        {log.details || "—"}
                      </p>
                    </div>

                    {/* IP Address */}
                    <div className="w-32 min-w-0">
                      {log.ipAddress ? (
                        <span className="text-[11px] font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground">
                          {log.ipAddress}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">—</span>
                      )}
                    </div>

                    {/* Time */}
                    <div className="w-36 text-right pr-2">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {timeAgo(log.createdAt)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70" title={new Date(log.createdAt).toLocaleString()}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
