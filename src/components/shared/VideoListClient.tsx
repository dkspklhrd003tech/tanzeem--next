"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideoListClient({ vids }: { vids: any[] }) {
  const [activeVideo, setActiveVideo] = useState<any>(null);

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
          <div key={v.id}
            onClick={() => setActiveVideo(v)}
            className="rounded-2xl border border-border/50 overflow-hidden bg-card flex flex-col cursor-pointer group hover:border-primary/50 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 duration-300">

            {/* Thumbnail Placeholder */}
            <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-primary transition-colors shadow-lg">
                <Play className="w-8 h-8 text-primary group-hover:text-white ml-1 transition-colors" />
              </div>
            </div>

            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-lg leading-tight flex items-center gap-2 group-hover:text-primary transition-colors">
                  {v.title}
                  {v.isNew && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]">New</span>}
                </h3>
                {v.episodeNumber && <span className="shrink-0 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">Ep {v.episodeNumber}</span>}
              </div>
              {v.description && <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{v.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!activeVideo} onOpenChange={(o) => !o && setActiveVideo(null)}>
        <DialogContent className="sm:max-w-4xl bg-slate-950/95 backdrop-blur-xl border-slate-800 p-0 overflow-hidden shadow-2xl">
          <DialogTitle className="sr-only">{activeVideo?.title || "Video Player"}</DialogTitle>
          <div className="aspect-video w-full bg-black relative">
            {activeVideo?.embedUrl ? (
              <iframe
                src={activeVideo.embedUrl}
                className="w-full h-full absolute inset-0 border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : activeVideo?.videoUrl ? (
              <video controls autoPlay className="w-full h-full absolute inset-0" preload="metadata">
                <source src={activeVideo.videoUrl} type="video/mp4" />
                <source src={activeVideo.videoUrl} type="video/webm" />
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 font-medium">No Media Provided</div>
            )}
          </div>
          <div className="p-5 border-t border-slate-800/60 bg-slate-950/50">
            <h3 className="text-xl font-bold text-white">{activeVideo?.title}</h3>
            {activeVideo?.description && <p className="text-sm text-slate-400 mt-2 leading-relaxed">{activeVideo.description}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
