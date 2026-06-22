"use client";

import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";

interface VideoDetailProps {
  video: {
    id: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    embedUrl?: string | null;
    thumbnailUrl?: string | null;
    duration?: number | null;
    speakerName?: string | null;
    categoryName?: string | null;
    publishedAt?: Date | string | null;
  };
  backHref: string;
  backLabel: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function VideoDetail({ video, backHref, backLabel }: VideoDetailProps) {
  const youtubeId = video.embedUrl ? getYouTubeId(video.embedUrl) : getYouTubeId(video.videoUrl);

  return (
    <div className="container mx-auto py-8 md:py-10 px-4">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Video Player */}
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.videoUrl ? (
            <video controls className="w-full h-full" src={video.videoUrl}>
              Your browser does not support the video element.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Video not available</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{video.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {video.speakerName && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" /> {video.speakerName}
              </span>
            )}
            {video.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
              </span>
            )}
            {video.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {new Date(video.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {video.description && (
            <p className="text-muted-foreground leading-relaxed">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
