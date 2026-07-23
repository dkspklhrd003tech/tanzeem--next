"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Headphones, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientShareButton } from "@/components/shared/ClientShareButton";
import { VideoEmbed } from "./VideoEmbed";
import { WaveformPlayer } from "./WaveformPlayer";
import { resolveMediaUrl } from "@/lib/utils";

interface AudioDetailProps {
  audio: {
    id: string;
    title: string;
    description?: string | null;
    audioUrl?: string | null;
    videoUrl?: string | null;
    duration?: number | null;
    thumbnailUrl?: string | null;
    speakerName?: string | null;
    categoryName?: string | null;
    publishedAt?: Date | string | null;
  };
  backHref: string;
  backLabel: string;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioDetail({ audio, backHref, backLabel }: AudioDetailProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
        {/* Thumbnail */}
        {/* <div className="lg:col-span-1">
          {audio.thumbnailUrl ? (
            <img
              src={audio.thumbnailUrl}
              alt={audio.title}
              className="w-full aspect-square rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-15 h-15 rounded-xl bg-primary/10 flex items-center justify-center shadow-lg">
              <Headphones className="h-8 w-8 text-primary/40" />
            </div>
          )}
        </div> */}

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            {audio.speakerName && (
              <p className="text-lg text-primary font-medium mb-2">{audio.speakerName}</p>
            )}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                {audio.title}
              </h1>
              <ClientShareButton variant="icon" className="shrink-0 mt-1" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {audio.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatDuration(audio.duration)}
              </span>
            )}
            {audio.categoryName && (
              <span className="flex items-center gap-1">
                <Headphones className="h-4 w-4" /> {audio.categoryName}
              </span>
            )}
            {audio.publishedAt && (
              <span className="flex items-center gap-1.5 border border-primary text-primary px-3 py-1 rounded-full text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" /> {new Date(audio.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {audio.description && (
            <p className="text-foreground leading-relaxed">{audio.description}</p>
          )}

          {/* Media Player */}
          {audio.videoUrl ? (
            <VideoEmbed url={audio.videoUrl} />
          ) : audio.audioUrl ? (
            <WaveformPlayer
              audioUrl={audio.audioUrl}
              title={audio.title}
              speakerName={audio.speakerName || undefined}
              categoryName={audio.categoryName || undefined}
              publishedAt={audio.publishedAt}
            />
          ) : null}

          {/* Download */}
          {audio.audioUrl && (
            <div className="flex gap-3">
              <Button asChild variant="default" className="gap-2">
                <a href={resolveMediaUrl(audio.audioUrl)} download>
                  <Download className="h-4 w-4" /> Download
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
