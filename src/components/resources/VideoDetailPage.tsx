"use client";

import Link from "next/link";
import { Video, Share2, Clock, Eye, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
  category: { id: string; name: string; slug: string } | null;
  speaker: { id: string; name: string; slug: string; bio: string | null; avatar: string | null } | null;
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
  if (embedUrl) return embedUrl;
  const yt = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  return null;
}

export function VideoDetailPage({ item, related }: { item: VideoItem; related: VideoItem[] }) {
  const embedSrc = toEmbedSrc(item.videoUrl, item.embedUrl);

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: item.title, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10">
      <Link href="/videos" className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Video Library
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {/* Video embed */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden bg-black aspect-video">
            {embedSrc ? (
              <iframe
                src={embedSrc}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <video controls src={item.videoUrl} className="w-full h-full" poster={item.thumbnailUrl ?? undefined}>
                Your browser does not support the video element.
              </video>
            )}
          </motion.div>

          {/* Meta */}
          <div>
            {item.category && <Badge variant="outline" className="text-primary border-primary/30 mb-3">{item.category.name}</Badge>}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug mb-3">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted mb-4">
              {item.speaker && (
                <Link href={`/videos?speaker=${item.speaker.slug}`} className="hover:text-primary font-medium transition-colors">
                  {item.speaker.name}
                </Link>
              )}
              {item.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDuration(item.duration)}</span>}
              {item.viewCount > 0 && <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{item.viewCount.toLocaleString()} views</span>}
            </div>
            <div className="flex gap-3">
              <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-dark transition-colors">
                <ExternalLink className="h-4 w-4" /> Watch on YouTube
              </a>
              <Button variant="outline" size="sm" className="rounded-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>

          {item.description && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted mb-3">Description</h2>
              <p className="text-foreground-muted leading-relaxed text-sm">{item.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {item.speaker && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-4">Speaker</h2>
              <div className="flex items-center gap-3">
                {item.speaker.avatar ? (
                  <img src={item.speaker.avatar} alt={item.speaker.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{item.speaker.name[0]}</div>
                )}
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.speaker.name}</p>
                  {item.speaker.bio && <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">{item.speaker.bio}</p>}
                </div>
              </div>
              <Link href={`/videos?speaker=${item.speaker.slug}`} className="mt-3 block text-xs text-primary hover:underline">More by {item.speaker.name} →</Link>
            </div>
          )}

          {related.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-4">Related Videos</h2>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link key={r.id} href={`/videos/${r.slug}`} className="flex gap-3 group">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {r.thumbnailUrl ? (
                        <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Video className="h-5 w-5 text-muted-foreground/40" /></div>
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
