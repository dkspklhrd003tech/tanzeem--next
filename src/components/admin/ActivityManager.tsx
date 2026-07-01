"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { Activity, Clock, FileText, ArrowRight, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ActivityManager() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/activity");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds for real-time feel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  const activities = data?.activities || [];
  const recentPages = data?.recentPages || [];
  const trafficData = data?.trafficData || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">System Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of admin actions, page updates, and traffic.</p>
        </div>
      </div>

      {/* Traffic Graph */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Page Views Overview
          </CardTitle>
          <CardDescription>Website traffic over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="views" name="Page Views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity & Pages Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <Card className="border-border/60 shadow-sm flex flex-col h-full bg-[#030b15] border-[#1e293b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-emerald-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-400">Last 10 admin actions</CardDescription>
            </div>
            <Button variant="link" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium px-0">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 mt-4">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity found.</p>
            ) : (
              <ul className="space-y-6">
                {activities.map((activity: any) => (
                  <li key={activity.id} className="flex gap-4 relative">
                    <div className="mt-1.5 relative z-10">
                      <div className={cn(
                        "w-2 h-2 rounded-full ring-4 ring-[#030b15]",
                        activity.action.toLowerCase().includes('create') ? "bg-emerald-500" :
                        activity.action.toLowerCase().includes('delete') ? "bg-red-500" :
                        "bg-blue-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">
                        {activity.action.toUpperCase()} {activity.entityType}
                      </p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {activity.details || `Modified ${activity.entityType} record`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        <span className="mx-1">•</span>
                        by <span className="text-slate-300">{activity.user?.name || "System"}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Pages */}
        <Card className="border-border/60 shadow-sm flex flex-col h-full bg-[#030b15] border-[#1e293b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-emerald-500" />
                Recent Pages
              </CardTitle>
              <CardDescription className="text-slate-400">Last 5 edited pages</CardDescription>
            </div>
            <Button variant="link" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium px-0" asChild>
              <Link href="/sitemanager/pages">
                All pages <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 mt-4">
            {recentPages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No pages found.</p>
            ) : (
              <div className="space-y-4">
                {recentPages.map((page: any) => (
                  <Link href={`/sitemanager/pages/${page.id}/edit`} key={page.id} className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#1e293b] bg-[#0f172a]/50 hover:bg-[#1e293b]/50 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                          {page.title || "Untitled Page"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-1">/{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <Badge variant="outline" className={cn(
                          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-normal",
                          !page.isPublished && "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        )}>
                          {page.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-xs text-slate-400 min-w-[80px] text-right">
                          {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
