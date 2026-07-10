import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WaveformPlayerProps {
  audioUrl: string;
  title: string;
  speakerName?: string;
  categoryName?: string;
  publishedAt?: Date | string | null;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function WaveformPlayer({
  audioUrl,
  title,
  speakerName,
  categoryName,
  publishedAt,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#4b5563", // Tailwind gray-600
      progressColor: "#10b981", // Tailwind emerald-500 (primary)
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 80,
      normalize: true,
      url: audioUrl,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("seeking", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  let formattedDate = "";
  if (publishedAt) {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = formatDistanceToNow(d, { addSuffix: true });
    }
  }

  return (
    <div className="bg-[#181818] rounded-xl overflow-hidden shadow-lg p-6 flex flex-col gap-6 text-white w-full">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!isReady}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground fill-current" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
            )}
          </button>

          {/* Title and Speaker */}
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm font-medium">
              {speakerName || "Unknown Speaker"}
            </span>
            <h2 className="text-2xl font-bold line-clamp-1">{title}</h2>
          </div>
        </div>

        {/* Meta Section */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {formattedDate && (
            <span className="text-gray-400 text-xs font-medium">{formattedDate}</span>
          )}
          {categoryName && (
            <span className="px-3 py-1 bg-[#282828] text-gray-300 text-xs font-semibold rounded-full border border-gray-700">
              # {categoryName}
            </span>
          )}
        </div>
      </div>

      {/* Waveform Section */}
      <div className="relative w-full">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#181818] z-10">
            <span className="text-sm text-gray-400 animate-pulse">Loading audio...</span>
          </div>
        )}
        <div ref={containerRef} className="w-full relative cursor-pointer" />
        
        {/* Time bubble (like Soundcloud) */}
        {isReady && (
          <div className="absolute right-0 bottom-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 z-10 pointer-events-none shadow-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>
    </div>
  );
}
