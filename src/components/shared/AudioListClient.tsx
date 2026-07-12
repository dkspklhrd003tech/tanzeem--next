"use client";

import { Play } from "lucide-react";
import Link from "next/link";

export function AudioListClient({ audios }: { audios: any[] }) {

  if (audios.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground text-lg">No audios found for this speaker yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 space-y-3">
        {audios.map((a: any) => (
          <Link key={a.id}
            href={`/audio/${a.slug}`}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-primary-light/80 hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {a.code && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{a.code}</span>}
                <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                  {a.title}
                  {a.isNew && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full">New</span>}
                </h3>
              </div>
              {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center gap-1">
              <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm">
                <Play className="w-6 h-6" />
              </button>
              <span className="text-[11px] text-foreground font-medium transition-opacity">Listen Now</span>
            </div>
          </Link>
        ))}
      </div>

    </>
  );
}
