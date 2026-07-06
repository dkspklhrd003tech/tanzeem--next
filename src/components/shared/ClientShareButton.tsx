"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ClientShareButton({ className, variant = "default" }: { className?: string, variant?: "default" | "icon" }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Link copied!", description: "URL copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
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
      {variant === "default" && (copied ? "Copied" : "Share")}
    </button>
  );
}
