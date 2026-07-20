"use client";

import React from "react";
import Link from "next/link";
import { Download, Share2, Clock, Play, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { WaveformPlayer } from "./WaveformPlayer";
import { useMediaTracking } from "@/hooks/useMediaTracking";

type AudioItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  duration: number | null;
  thumbnailUrl: string | null;
  playCount: number;
  category: { id: string; name: string; slug: string } | null;
  speaker: { id: string; name: string; slug: string; bio: string | null; avatar: string | null } | null;
  customFields?: any;
  pdfUrl?: string | null;
  downloadCount?: number;
  shareCount?: number;
  fileSize?: number | null;
};

interface AudioPlayerPageProps {
  item: AudioItem;
  related: AudioItem[];
  customFieldSchema?: any[];
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export function AudioPlayerPage({ item, related, customFieldSchema = [] }: AudioPlayerPageProps) {
  const { trackPlay, trackShare, trackDownload } = useMediaTracking("audio", item.id);

  const handleTracked = async () => {
    await trackPlay();
  };

  const handleShare = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(window.location.href);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url: window.location.href });
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Error sharing:", err);
      }
    } else {
      alert("Link copied to clipboard!");
    }

    await trackShare();
  };

  const handleDownload = async () => {
    await trackDownload();
  };

  return (
    <div className="container max-w-7xl mx-auto py-10">

      {/* Back */}
      <Link href="/audios-by-speaker" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Audio Speakers
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Player column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waveform Player */}
          <div className="w-full">
            <WaveformPlayer
              audioUrl={item.audioUrl}
              title={item.title}
              speakerName={item.speaker?.name}
              categoryName={item.category?.name}
              publishedAt={item.customFields?.publishedAt || null}
              onTracked={handleTracked}
            />
          </div>

          {/* Meta & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-primary-light rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground-muted">
              {item.category && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {item.category.name}
                </Badge>
              )}
              {item.duration && (
                <div className="flex items-center gap-1.5 text-foreground-muted">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(item.duration)}</span>
                </div>
              )}
              <div className="flex items-center gap-4 border-l border-border/50">
                <div className="flex text-foreground items-center gap-1.5" title="Play">
                  <Play className="w-4 h-4" />
                </div>
              </div>
              {item.fileSize ? (
                <div className="flex text-foreground items-center gap-1.5" title="File Size">
                  <span>{(item.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={resolveMediaUrl(item.audioUrl)}
                download
                onClick={handleDownload}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
                  "bg-primary text-white transition-colors"
                )}
              >
                <Download className="h-4 w-4" />
                Download Audio
              </a>
              {item.pdfUrl && (
                <a
                  href={resolveMediaUrl(item.pdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  View PDF
                </a>
              )}
              <Button variant="outline" size="sm" className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold", "bg-primary text-white transition-colors")} onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted mb-3">Description</h2>
              <p className="text-foreground-muted leading-relaxed text-sm">{item.description}</p>
            </div>
          )}

          {/* Dynamic Custom Fields */}
          {customFieldSchema.length > 0 && Object.keys(item.customFields || {}).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted mb-2">Additional Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customFieldSchema.map((field) => {
                  const val = item.customFields?.[field.fieldKey];
                  if (val === undefined || val === null || val === "") return null;

                  return (
                    <div key={field.id} className="space-y-1">
                      <p className="text-xs text-foreground-muted uppercase tracking-wider">{field.label}</p>
                      {field.fieldType === "url" || field.fieldType === "file" ? (
                        <a href={val} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                          {val}
                        </a>
                      ) : field.fieldType === "toggle" ? (
                        <p className="text-sm font-medium">{val ? "Yes" : "No"}</p>
                      ) : (
                        <p className="text-sm font-medium" dir={typeof val === 'string' && /[\u0600-\u06FF]/.test(val) ? "rtl" : "ltr"}>
                          {val}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — speaker + related */}
        <div className="space-y-6">
          {/* Speaker card */}
          {item.speaker && (
            <div className="bg-primary-light border border-primary/80 rounded-lg p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-primary mb-4">Speaker</h2>
              <div className="flex items-center gap-3">
                {item.speaker.avatar ? (
                  <img src={item.speaker.avatar} alt={item.speaker.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {item.speaker.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.speaker.name}</p>
                  {item.speaker.bio && (
                    <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">{item.speaker.bio}</p>
                  )}
                </div>
              </div>
              <Link
                href={`/audios-by-speaker/${item.speaker.slug}`}
                className="mt-3 block text-xs text-primary hover:underline"
              >
                More by {item.speaker.name} →
              </Link>
            </div>
          )}

          {/* Related Lectures */}
          {related.length > 0 && (
            <div className="bg-primary-light border border-primary/80 rounded-lg p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-primary mb-4">Related Lectures</h2>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/audio/${r.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {r.thumbnailUrl ? (
                        <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary line-clamp-2 leading-snug transition-colors">
                        {r.title}
                      </p>
                      {r.speaker && (
                        <p className="text-[10px] text-foreground-muted mt-0.5">{r.speaker.name}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
