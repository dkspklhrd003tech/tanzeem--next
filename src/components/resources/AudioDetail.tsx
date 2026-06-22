"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Headphones, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioDetailProps {
  audio: {
    id: string;
    title: string;
    description?: string | null;
    audioUrl: string;
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
    <div className="container mx-auto py-8 md:py-10 px-4">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Thumbnail */}
        <div className="lg:col-span-1">
          {audio.thumbnailUrl ? (
            <img
              src={audio.thumbnailUrl}
              alt={audio.title}
              className="w-full aspect-square rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-full aspect-square rounded-xl bg-primary/10 flex items-center justify-center shadow-lg">
              <Headphones className="h-20 w-20 text-primary/40" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{audio.title}</h1>
            {audio.speakerName && (
              <p className="text-lg text-primary font-medium">{audio.speakerName}</p>
            )}
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
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {new Date(audio.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {audio.description && (
            <p className="text-muted-foreground leading-relaxed">{audio.description}</p>
          )}

          {/* Audio Player */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <audio controls className="w-full" src={audio.audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Download */}
          <div className="flex gap-3">
            <Button asChild variant="default" className="gap-2">
              <a href={audio.audioUrl} download>
                <Download className="h-4 w-4" /> Download
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
