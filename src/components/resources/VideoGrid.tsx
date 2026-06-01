"use client";

import { useState, useMemo } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type VideoItem = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  speakerName?: string | null;
  categoryName?: string | null;
};

type Props = { items: VideoItem[] };

function youtubeThumb(url: string, fallback?: string | null) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  return fallback || "https://placehold.co/800x450/0D5844/C8A96E?text=Video";
}

export function VideoGrid({ items }: Props) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      items.filter((v) =>
        v.title.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search videos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <a
            key={item.id}
            href={item.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border border-border rounded-md overflow-hidden bg-card hover:border-primary/40 transition-colors"
          >
            <div className="relative aspect-video">
              <img
                src={youtubeThumb(item.videoUrl, item.thumbnailUrl)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 flex items-center justify-center transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary fill-primary ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary">{item.title}</h3>
              <p className="text-xs text-foreground-muted mt-1">
                {[item.speakerName, item.categoryName].filter(Boolean).join(" · ")}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export const EXTERNAL_VIDEO_LINKS = [
  { title: "Dr. Israr Ahmad Lectures", href: "https://www.drisrar.com", description: "Complete lecture archive" },
  { title: "Dr. Israr Ahmad (Q&A)", href: "https://www.youtube.com/@AskDrIsrar", description: "Question & answer sessions" },
  { title: "Bayan ul Quran", href: "https://www.youtube.com/@BiyanulQuran", description: "Quranic exegesis series" },
  { title: "Muntakab Nisab", href: "https://www.youtube.com/@MuntakhabNisab", description: "Selected syllabus lectures" },
  { title: "Dr. Israr Ahmad (Video Clips)", href: "https://www.youtube.com/@DrIsrarAhmed_Official", description: "Short clips and highlights" },
];

export function ExternalVideoLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      {EXTERNAL_VIDEO_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-5 border border-border rounded-md bg-card hover:border-primary/40 transition-colors"
        >
          <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">{link.title}</h3>
            <p className="text-sm text-foreground-muted mt-1">{link.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
