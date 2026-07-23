"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { resolveMediaUrl } from "@/lib/utils";

interface WaveformPlayerProps {
  audioUrl: string;
  title: string;
  speakerName?: string;
  categoryName?: string;
  publishedAt?: Date | string | null;
  onTracked?: () => void;
}

function formatTime(seconds: number) {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const trackedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tick current time via rAF while playing (smooth scrubber)
  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);

    // Trigger tracking once at 10 seconds
    if (audio.currentTime >= 10 && !trackedRef.current) {
      trackedRef.current = true;
      onTracked?.();
    }

    if (!audio.paused) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [onTracked]);

  useEffect(() => {
    setIsMounted(true);

    const resolvedUrl = resolveMediaUrl(audioUrl);
    if (!resolvedUrl) return;

    const audio = new Audio();
    audio.preload = "metadata";
    // No crossOrigin — FTP server has no CORS headers; opaque requests play fine
    audio.src = resolvedUrl;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onDurationChange = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onError = () => {
      const code = audio.error?.code;
      const msg =
        code === 4
          ? "Audio format not supported or file unavailable."
          : code === 3
            ? "Audio file is corrupted or encoding error."
            : "Could not load audio. Check the file URL.";
      setError(msg);
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.src = "";
    };
  }, [audioUrl, tick]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      setIsLoading(true);
      try {
        await audio.play();
      } catch (e) {
        console.error("[WaveformPlayer] play() failed:", e);
        setIsLoading(false);
        setError("Playback was blocked. Tap again to try.");
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  // Click on progress bar → seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  let formattedDate = "";
  if (publishedAt) {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = formatDistanceToNow(d, { addSuffix: true });
    }
  }

  if (!isMounted) {
    return <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col gap-6 w-full animate-pulse h-40" />;
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col gap-5 text-white w-full">

      {/* ── Header Row ── */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4 items-center flex-1 min-w-0">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            disabled={!!error}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 text-white fill-white" />
            ) : (
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            )}
          </button>

          <div className="flex flex-col min-w-0">
            <span className="text-white text-xs font-medium truncate">
              {speakerName || "Unknown Speaker"}
            </span>
            <h2 className="text-xl font-bold line-clamp-2 leading-tight">{title}</h2>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {formattedDate && (
            <span className="text-foreground/80 text-xs">{formattedDate}</span>
          )}
          {categoryName && (
            <span className="px-3 py-1 bg-[#282828] text-gray-300 text-xs font-semibold rounded-full border border-gray-700">
              # {categoryName}
            </span>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-900/60 border border-red-600/50 rounded-lg px-4 py-2 text-xs text-red-200">
          ⚠ {error}
        </div>
      )}

      {/* ── Progress / Scrubber ── */}
      {!error && (
        <div className="space-y-2">
          {/* Fake waveform bars as background decoration */}
          <div
            ref={progressBarRef}
            className="relative h-16 cursor-pointer group"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Audio progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Decorative bars (static — looks like a waveform) */}
            <div className="absolute inset-0 flex items-center gap-[2px]">
              {Array.from({ length: 60 }).map((_, i) => {
                // Sinusoidal height pattern simulating a waveform
                const h = 20 + 40 * Math.abs(Math.sin(i * 0.45 + 1)) * Math.abs(Math.sin(i * 0.12));
                const filled = (i / 60) * 100 <= progress;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-colors duration-100"
                    style={{
                      height: `${h}%`,
                      backgroundColor: filled ? "#0d5844" : "#3f4958",
                    }}
                  />
                );
              })}
            </div>

            {/* Invisible wide click target overlay */}
            <div className="absolute inset-0" />
          </div>

          {/* Time + mute row */}
          <div className="flex items-center justify-between text-xs text-foreground/80 font-mono">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
