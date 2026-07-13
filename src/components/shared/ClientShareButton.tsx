"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ClientShareButton({ className, variant = "default", entityType, entityId, shareCount }: { className?: string, variant?: "default" | "icon", entityType?: string, entityId?: string, shareCount?: number }) {
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(shareCount || 0);
  const { toast } = useToast();

  const handleShare = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    if (entityType && entityId) {
      try {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityType, entityId, actionType: "share" })
        });
        setCount(prev => prev + 1);
      } catch (e) { }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({ title: "Link copied!", description: "URL copied to clipboard." });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Error sharing:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share"
      className={cn(
        "flex items-center justify-center gap-2 transition-colors",
        variant === "default" && "w-full border border-border rounded-full px-6 py-2.5 text-sm text-foreground-muted hover:border-primary hover:text-primary",
        variant === "icon" && "text-foreground-muted hover:text-primary p-2 rounded-full hover:bg-muted",
        className
      )}
    >
      {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
      {variant === "default" && (copied ? "Copied" : shareCount !== undefined ? `Share (${count})` : "Share")}
    </button>
  );
}
