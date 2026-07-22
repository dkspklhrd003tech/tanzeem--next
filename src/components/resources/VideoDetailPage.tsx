"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Video, Share2, Clock, PlayCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ClientShareButton } from "@/components/shared/ClientShareButton";
import { TrackedDownloadLink } from "@/components/shared/TrackedDownloadLink";
import { useMediaTracking } from "@/hooks/useMediaTracking";

type VideoItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
  playCount?: number;
  downloadCount?: number;
  shareCount?: number;
  fileSize?: number;
  category: { id: string; name: string; slug: string } | null;
  speaker: { id: string; name: string; slug: string; bio: string | null; avatar: string | null } | null;
  customFields?: any;
};

function formatDuration(secs: number | null) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Build an embeddable iframe src from a YouTube URL or embed URL. */
function toEmbedSrc(videoUrl: string, embedUrl: string | null): string | null {
  if (embedUrl) {
    const srcMatch = embedUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) return srcMatch[1];
    return embedUrl;
  }
  const yt = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  return null;
}

export function VideoDetailPage({ item, related, customFieldSchema = [] }: { item: VideoItem; related: VideoItem[]; customFieldSchema?: any[] }) {
  const embedSrc = toEmbedSrc(item.videoUrl, item.embedUrl);
  const { trackPlay } = useMediaTracking("video", item.id);

  const trackedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const trackView = async () => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    await trackPlay();
  };

  // Cross-origin iframe tracking (Rumble, YT, Dailymotion, etc)
  useEffect(() => {
    if (!embedSrc) return;

    let timer: NodeJS.Timeout;

    const handleBlur = () => {
      // If the active element is our iframe, it means the user clicked inside it (likely Play)
      if (document.activeElement === iframeRef.current) {
        if (!trackedRef.current) {
          // Start 10-second timer to count as a view
          timer = setTimeout(() => {
            trackView();
          }, 10000);
        }
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
      clearTimeout(timer);
    };
  }, [embedSrc, item.slug]);



  let playerName = "External Site";
  let externalLink = item.videoUrl || item.embedUrl;
  if (externalLink) {
    if (externalLink.includes("youtube") || externalLink.includes("youtu.be")) {
      playerName = "YouTube";
      if (externalLink.includes("/embed/")) {
        const id = externalLink.split("/embed/")[1]?.split("?")[0];
        if (id) externalLink = `https://www.youtube.com/watch?v=${id}`;
      }
    }
    else if (externalLink.includes("vimeo")) {
      playerName = "Vimeo";
      if (externalLink.includes("player.vimeo.com/video/")) {
        const id = externalLink.split("/video/")[1]?.split("?")[0];
        if (id) externalLink = `https://vimeo.com/${id}`;
      }
    }
    else if (externalLink.includes("dailymotion") || externalLink.includes("dai.ly")) {
      playerName = "Dailymotion";
      if (externalLink.includes("/embed/video/")) {
        const id = externalLink.split("/embed/video/")[1]?.split("?")[0];
        if (id) externalLink = `https://www.dailymotion.com/video/${id}`;
      }
    }
    else if (externalLink.includes("ok.ru")) {
      playerName = "OK.ru";
      if (externalLink.includes("/videoembed/")) {
        externalLink = externalLink.replace("/videoembed/", "/video/");
      }
    }
    else if (externalLink.includes("facebook")) {
      playerName = "Facebook";
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <Link href="/videos-by-speakers" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Video Library
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {/* Meta */}
          <div>
            {item.category && <Badge variant="outline" className="text-primary border-primary/30 mb-3">{item.category.name}</Badge>}
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted mb-4">
              {item.speaker && (
                <Link href={`/videos?speaker=${item.speaker.slug}`} className="hover:text-primary font-medium transition-colors">
                  {item.speaker.name}
                </Link>
              )}
              {item.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDuration(item.duration)}</span>}
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-muted/50 text-foreground-muted font-medium border border-border">
                <PlayCircle className="h-4 w-4" /> Played
              </div>
              <ClientShareButton variant="default" className="w-auto px-4 py-2 text-sm bg-primary text-white rounded-full" entityType="video" entityId={item.id} shareCount={item.shareCount} />
              {(!embedSrc && item.videoUrl) ? (
                <TrackedDownloadLink
                  href={item.videoUrl}
                  entityType="video"
                  entityId={item.id}
                  fileSize={item.fileSize}
                  downloadCount={item.downloadCount}
                  className="rounded-full px-4 py-2 h-auto bg-primary text-white text-sm shadow-none border-0"
                />
              ) : (
                <a href={externalLink || undefined} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white transition-colors">
                  <ExternalLink className="h-4 w-4" /> Watch on {playerName}
                </a>
              )}
            </div>
          </div>

          {/* Video embed */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden bg-black aspect-video">
            {embedSrc ? (
              <iframe
                ref={iframeRef}
                src={embedSrc}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <video
                controls
                src={item.videoUrl}
                className="w-full h-full"
                poster={item.thumbnailUrl ?? undefined}
                onTimeUpdate={(e) => {
                  if (e.currentTarget.currentTime > 10) {
                    trackView();
                  }
                }}
              >
                Your browser does not support the video element.
              </video>
            )}
          </motion.div>

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

        {/* Sidebar */}
        <div className="space-y-6">
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
                  {item.speaker.bio && <p className="text-md text-primary font-nastaleeq mt-0.5 line-clamp-1">{item.speaker.bio}</p>}
                </div>
              </div>
              <Link href={`/videos-by-speakers/${item.speaker.slug}`} className="mt-3 block text-xs text-primary hover:underline">
                More by {item.speaker.name} →
              </Link>
            </div>
          )}

          {related.length > 0 && (
            <div className="bg-primary-light border border-primary/80 rounded-lg p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-primary mb-4">Related Videos</h2>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link key={r.id} href={`/videos/${r.slug}`} className="flex gap-3 group">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {r.thumbnailUrl ? (
                        <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-7 w-7 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary line-clamp-2 leading-snug transition-colors">{r.title}</p>
                      {r.speaker && <p className="text-[10px] text-foreground-muted mt-0.5">{r.speaker.name}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
