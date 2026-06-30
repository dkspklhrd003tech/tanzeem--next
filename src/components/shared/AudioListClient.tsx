"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";

export function AudioListClient({ audios }: { audios: any[] }) {
  const [activeAudio, setActiveAudio] = useState<any>(null);

  if (audios.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground text-lg">No audios found for this speaker yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {audios.map((a: any) => (
          <div key={a.id} 
               onClick={() => setActiveAudio(a)}
               className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 bg-card hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
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
            
            <div className="shrink-0 flex items-center">
              <span className="text-xs text-muted-foreground font-medium mr-4 opacity-0 group-hover:opacity-100 transition-opacity">Listen Now</span>
              <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm">
                <Play className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!activeAudio} onOpenChange={(o) => !o && setActiveAudio(null)}>
        <DialogContent className="sm:max-w-md bg-slate-950/90 backdrop-blur-xl border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-200">{activeAudio?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
               <Play className="w-10 h-10 text-primary ml-1" />
            </div>
            {activeAudio?.audioUrl && (
              <audio controls autoPlay className="w-full outline-none">
                <source src={activeAudio.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
