"use client";

import { useEffect, useState } from "react";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface RedirectPageProps {
  title: string;
  url: string;
}

export function RedirectPage({ title, url }: RedirectPageProps) {
  const { settings } = useSettings();
  const [countdown, setCountdown] = useState(3);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Attempt automatic popup redirect
    if (typeof window !== "undefined") {
      const newTab = window.open(url, "_blank");
      if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
        // Popup was blocked
        setBlocked(true);
      }
    }

    // Countdown timer for fallback or visibility
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [url]);

  return (
    <main className="min-h-screen bg-[#fafaf9] dark:bg-[#070707] flex flex-col">
      {/* Dynamic site banner */}
      <PageBanner settings={settings} />

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="bg-white dark:bg-[#111111] border border-border/80 rounded-2xl p-8 max-w-md w-full text-center shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle accent border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary" />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">External Resource Portal</p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center">
            {blocked ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl p-4 text-xs max-w-sm mb-4">
                Your browser blocked the automatic redirect. Please click the button below to proceed.
              </div>
            ) : (
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening in a new tab...
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button asChild size="lg" className="w-full rounded-full bg-primary hover:bg-primary/95 text-white font-semibold transition-all shadow-md hover:shadow-lg">
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                Continue to Portal
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60">
            You are leaving Tanzeem.org to access our external system.
          </div>
        </div>
      </div>
    </main>
  );
}
