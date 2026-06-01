"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioPlayButton } from "@/components/shared/AudioPlayButton";
import { cn } from "@/lib/utils";

export type AudioListItem = {
  id: string;
  title: string;
  description?: string | null;
  audioUrl: string;
  thumbnailUrl?: string | null;
  publishedAt?: Date | string | null;
  speakerName?: string | null;
  categoryName?: string | null;
  speakerId?: string | null;
  categoryId?: string | null;
};

type Props = {
  items: AudioListItem[];
  showFilters?: boolean;
  categories?: { id: string; name: string }[];
  speakers?: { id: string; name: string }[];
};

export function AudioList({ items, showFilters = true, categories = [], speakers = [] }: Props) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [speakerId, setSpeakerId] = useState<string>("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q);
      const matchCat = categoryId === "all" || item.categoryId === categoryId;
      const matchSpeaker = speakerId === "all" || item.speakerId === speakerId;
      return matchSearch && matchCat && matchSpeaker;
    });
  }, [items, search, categoryId, speakerId]);

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search audio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {categories.length > 0 && (
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {speakers.length > 0 && (
            <Select value={speakerId} onValueChange={setSpeakerId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Speaker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All speakers</SelectItem>
                {speakers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-foreground-muted py-12">No audio found.</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-md bg-card">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="w-20 h-20 rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-foreground-muted mt-0.5">
                  {[item.speakerName, item.categoryName]
                    .filter(Boolean)
                    .join(" · ")}
                  {item.publishedAt &&
                    ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
                </p>
                {item.description && (
                  <p className="text-sm text-foreground-muted line-clamp-2 mt-1">
                    {item.description.replace(/<[^>]+>/g, "")}
                  </p>
                )}
              </div>
              <AudioPlayButton
                track={{
                  id: item.id,
                  title: item.title,
                  audioUrl: item.audioUrl,
                  speaker: item.speakerName || undefined,
                  thumbnail: item.thumbnailUrl || undefined,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
