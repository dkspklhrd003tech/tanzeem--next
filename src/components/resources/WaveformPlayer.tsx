"use client";

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
  onTracked?: () => void;
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
  onTracked,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const trackedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!containerRef.current) return;

    // Native audio element allows instant streaming instead of waiting for full download
    const audio = new Audio();
    audio.src = audioUrl;
    audio.preload = "metadata";
    audioRef.current = audio;

    // Initialize WaveSurfer with native media element
    let ws: any;
    try {
      ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#5b6470ff",
        progressColor: "#0d5844",
        cursorColor: "transparent",
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        height: 80,
        normalize: true,
        media: audio,
      });
      wavesurferRef.current = ws;
    } catch (e) {
      console.warn("WaveSurfer initialization failed, likely due to CORS/ORB. Audio will play natively.", e);
    }

    // Ready immediately to allow instant streaming playback
    setIsReady(true);
    
    audio.addEventListener("loadedmetadata", () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });
    
    // Add fallback events if ws didn't load
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));

    if (ws) {
      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("finish", () => setIsPlaying(false));

      const handleAudioProcess = () => {
        const current = ws.getCurrentTime();
        setCurrentTime(current);

        // Trigger tracking exactly once when passing 10 seconds
        if (current >= 10 && !trackedRef.current) {
          trackedRef.current = true;
          if (onTracked) onTracked();
        }
      };

      ws.on("audioprocess", handleAudioProcess);

      ws.on("seeking", () => {
        setCurrentTime(ws.getCurrentTime());
      });
    } else {
      // Fallback timeupdate
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        if (audio.currentTime >= 10 && !trackedRef.current) {
          trackedRef.current = true;
          if (onTracked) onTracked();
        }
      });
    }

    return () => {
      ws?.destroy();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Native play failed", e));
      }
    }
  };

  let formattedDate = "";
  if (publishedAt) {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = formatDistanceToNow(d, { addSuffix: true });
    }
  }

  if (!isMounted) {
    return <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col gap-6 w-full animate-pulse h-40"></div>;
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col gap-6 text-white w-full">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
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
            <span className="text-gray-200 text-sm font-medium">
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
        <div ref={containerRef} className="w-full relative cursor-pointer" />

        {/* Time bubble (like Soundcloud) */}
        {isReady && (
          <div className="absolute right-0 bottom-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-primary-light z-10 pointer-events-none shadow-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>
    </div>
  );
}
