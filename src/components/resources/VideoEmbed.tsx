import React from "react";
import { cn } from "@/lib/utils";

interface VideoEmbedProps {
  url: string;
  className?: string;
}

export function parseVideoUrl(url: string): { type: "iframe" | "video" | "raw"; content: string } {
  if (!url) return { type: "raw", content: "" };

  const trimmed = url.trim();

  // 1. Raw Iframe
  if (trimmed.toLowerCase().startsWith("<iframe")) {
    return { type: "raw", content: trimmed };
  }

  // 2. Direct Video File
  if (trimmed.match(/\.(mp4|webm|ogg)$/i)) {
    return { type: "video", content: trimmed };
  }

  // 3. YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: "iframe", content: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // 4. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "iframe", content: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // 5. Dailymotion
  const dmMatch = trimmed.match(/(?:dailymotion\.com\/video|dai\.ly)\/([a-zA-Z0-9]+)/);
  if (dmMatch && dmMatch[1]) {
    return { type: "iframe", content: `https://www.dailymotion.com/embed/video/${dmMatch[1]}` };
  }

  // 6. OK.ru
  const okruMatch = trimmed.match(/ok\.ru\/video\/([0-9]+)/);
  if (okruMatch && okruMatch[1]) {
    return { type: "iframe", content: `https://ok.ru/videoembed/${okruMatch[1]}` };
  }

  // 7. Rumble Embed URL check
  const rumbleMatch = trimmed.match(/rumble\.com\/embed\/([a-zA-Z0-9]+)/);
  if (rumbleMatch && rumbleMatch[1]) {
    return { type: "iframe", content: `https://rumble.com/embed/${rumbleMatch[1]}/` };
  }

  // If it's already an embed url
  if (trimmed.includes("/embed/")) {
    return { type: "iframe", content: trimmed };
  }

  // Fallback to video if it looks like a direct link but doesn't have extension, or just iframe
  return { type: "iframe", content: trimmed };
}

export function VideoEmbed({ url, className }: VideoEmbedProps) {
  if (!url) return null;

  const parsed = parseVideoUrl(url);

  if (parsed.type === "raw") {
    return (
      <div 
        className={cn("w-full aspect-video rounded-xl overflow-hidden shadow-lg", className)}
        dangerouslySetInnerHTML={{ __html: parsed.content }} 
      />
    );
  }

  if (parsed.type === "video") {
    return (
      <div className={cn("w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black", className)}>
        <video 
          controls 
          className="w-full h-full object-contain" 
          src={parsed.content} 
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className={cn("w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black relative", className)}>
      <iframe
        src={parsed.content}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
