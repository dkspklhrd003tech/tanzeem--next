"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ClientShareButton() {
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
      className="w-full flex items-center justify-center gap-2 border border-border rounded-full px-6 py-2.5 text-sm text-foreground-muted hover:border-primary hover:text-primary transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
