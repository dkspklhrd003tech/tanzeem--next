"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function VideoListClient({ vids }: { vids: any[] }) {

  if (vids.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground text-lg">No videos found for this speaker yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {vids.map((v: any) => (
          <Link key={v.id}
            href={v.slug.startsWith('http') ? v.slug : `/videos/${v.slug}`}
            target={v.customFields?.openInNewTab ? "_blank" : undefined}
            rel={v.customFields?.openInNewTab ? "noopener noreferrer" : undefined}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-primary-light/80 hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full">

            <div>
              <div className="flex items-center gap-2 mb-1">
                {v.episodeNumber && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">Ep {v.episodeNumber}</span>}
                <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-primary transition-colors line-clamp-2">
                  {v.title}
                  {v.isNew && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full">New</span>}
                </h3>
              </div>
              {v.description && <p className="text-sm text-muted-foreground line-clamp-2">{v.description}</p>}
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
              <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm">
                <Play className="w-5 h-5 ml-0.5" />
              </button>
              <span className="text-[11px] text-foreground font-medium transition-opacity">Watch Now</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
