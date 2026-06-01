"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioStore, type NowPlaying } from "@/store/audioStore";

type Props = {
  track: NowPlaying;
  size?: "sm" | "default";
};

export function AudioPlayButton({ track, size = "sm" }: Props) {
  const play = useAudioStore((s) => s.play);

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        play(track);
      }}
    >
      <Play className="h-3.5 w-3.5" />
      Play
    </Button>
  );
}
