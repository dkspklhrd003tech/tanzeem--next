"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Headphones,
  Video,
  BookOpen,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const upcomingEvents = [
  { title: "Weekly Study Circle", date: "Tomorrow, 8:00 PM", attendees: 45 },
  { title: "Quran Tafseer Session", date: "Friday, 7:00 PM", attendees: 120 },
  { title: "Youth Workshop", date: "Saturday, 10:00 AM", attendees: 35 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const { data, error, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds for real-time feel
    revalidateOnFocus: true
  });

  const stats = [
    {
      title: "Total Pages",
      value: data?.stats?.pages || 0,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "Audio Lectures",
      value: data?.stats?.audio || 0,
      icon: Headphones,
      color: "bg-purple-500",
    },
    {
      title: "Audio Books",
      value: data?.stats?.audioBooks || 0,
      icon: Headphones,
      color: "bg-fuchsia-500",
    },
    {
      title: "Videos",
      value: data?.stats?.videos || 0,
      icon: Video,
      color: "bg-red-500",
    },
    {
      title: "Books",
      value: data?.stats?.books || 0,
      icon: BookOpen,
      color: "bg-amber-500",
    },
    {
      title: "Press Releases",
      value: data?.stats?.pressReleases || 0,
      icon: FileText,
      color: "bg-teal-500",
    },
    {
      title: "Active Campaigns",
      value: data?.stats?.campaigns || 0,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Quranic Circles",
      value: data?.stats?.locations || 0,
      icon: Users,
      color: "bg-indigo-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-foreground-muted mt-1">Welcome back! Here's a real-time snapshot of your platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl px-5 border-border hover:bg-muted font-medium transition-all">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button asChild className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl px-6 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95">
            <Link href="/sitemanager/pages">Quick Add Page</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium flex items-center text-green-500"
                  )}>
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-foreground-muted">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Chart Placeholder */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Traffic Overview
              </CardTitle>
              <CardDescription>Website visits over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-foreground-muted">Chart visualization</p>
                  <p className="text-xs text-foreground-light">Integration with Recharts available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-foreground-muted animate-pulse">Loading live activity...</p>
              ) : (
                <ul className="space-y-4">
                  {data?.recentActivity?.map((activity: any, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        activity.type === "audio" && "bg-purple-500",
                        activity.type === "video" && "bg-red-500",
                        activity.type === "book" && "bg-amber-500",
                        activity.type === "page" && "bg-blue-500",
                        activity.type === "event" && "bg-green-500",
                        !["audio", "video", "book", "page", "event"].includes(activity.type) && "bg-primary"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-foreground-muted truncate">{activity.item}</p>
                        <p className="text-xs text-foreground-light border border-border/50 bg-background/50 rounded-md px-1 py-0.5 inline-block mt-1">
                          {new Date(activity.time).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                  {(!data?.recentActivity || data.recentActivity.length === 0) && (
                    <p className="text-sm text-foreground-muted">No recent activity detected.</p>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled events and gatherings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-1">{event.title}</h4>
                  <p className="text-sm text-foreground-muted mb-2">{event.date}</p>
                  <p className="text-xs text-foreground-light">{event.attendees} attendees</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/sitemanager/pages"><FileText className="h-4 w-4 mr-2" />New Page</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sitemanager?section=audio"><Headphones className="h-4 w-4 mr-2" />Add Audio</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sitemanager?section=videos"><Video className="h-4 w-4 mr-2" />Add Video</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sitemanager?section=books"><BookOpen className="h-4 w-4 mr-2" />Add Book</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sitemanager?section=press-releases"><FileText className="h-4 w-4 mr-2" />Press Release</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sitemanager?section=campaigns"><Calendar className="h-4 w-4 mr-2" />Campaign</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
