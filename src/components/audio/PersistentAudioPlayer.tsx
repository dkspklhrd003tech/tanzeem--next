"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  SkipBack,
  SkipForward,
  Headphones,
} from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { cn } from "@/lib/utils";

// Format seconds → MM:SS
function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Animated waveform bars
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-5">
      {[1, 1.6, 0.8, 1.4, 1, 1.8, 0.7, 1.3, 1].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          style={{ originY: 1 }}
          animate={
            isPlaying
              ? {
                scaleY: [h * 0.5, h, h * 0.3, h * 0.8, h * 0.5],
              }
              : { scaleY: 0.3 }
          }
          transition={
            isPlaying
              ? {
                duration: 0.8 + i * 0.07,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.06,
              }
              : { duration: 0.3 }
          }
          initial={{ scaleY: 0.3 }}
        />
      ))}
    </div>
  );
}

export function PersistentAudioPlayer() {
  const {
    current,
    isPlaying,
    volume,
    currentTime,
    duration,
    pause,
    stop,
    toggle,
    setVolume,
    setCurrentTime,
    setDuration,
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);

  // Sync audio element with store: play/pause
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    if (isPlaying) {
      el.play().catch(() => pause());
    } else {
      el.pause();
    }
  }, [isPlaying, current, pause]);

  // Load new track when `current` changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    el.src = current.audioUrl;
    el.volume = volume;
    el.play().catch(() => pause());
  }, [current?.id]); // eslint-disable-line

  // Sync volume
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    const el = audioRef.current;
    if (!el || isDragging) return;
    setCurrentTime(el.currentTime);
  }, [isDragging, setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    setDuration(el.duration);
  }, [setDuration]);

  // Seek on progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = fraction * duration;
    el.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume || 0.8);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  const skipSeconds = (secs: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(duration, el.currentTime + secs));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="audio-player"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100]",
          "bg-[#0d5844] text-[#fefefc]",
          "border-t border-[#c8a84e]/30 shadow-2xl shadow-black/30"
        )}
      >
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => pause()}
          preload="metadata"
        />

        {/* Progress bar — always visible at top edge */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-1 w-full bg-white/10 cursor-pointer group relative"
        >
          <motion.div
            className="h-full bg-[#c8a84e] relative"
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1 }}
          >
            {/* Scrubber handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#c8a84e] shadow-md opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2" />
          </motion.div>
        </div>

        {/* Main player body */}
        <div className="container mx-auto">
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="py-3 flex items-center gap-3 md:gap-5">
                  {/* Artwork + Waveform */}
                  <div className="relative shrink-0 h-12 w-12 hidden sm:flex items-center justify-center">
                    {current.thumbnail ? (
                      <img
                        src={current.thumbnail}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-[#c8a84e]">
                        <Headphones className="w-6 h-6" />
                      </div>
                    )}
                    {/* Live playing badge */}
                    {isPlaying && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d5844] animate-pulse" />
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <WaveformBars isPlaying={isPlaying} />
                      <p className="font-bold text-sm truncate leading-tight">{current.title}</p>
                    </div>
                    {current.titleUrdu && (
                      <p dir="rtl" className="text-[11px] text-[#fefefc]/60 truncate font-urdu leading-relaxed">
                        {current.titleUrdu}
                      </p>
                    )}
                    {current.speaker && (
                      <p className="text-[11px] text-[#c8a84e]/80 truncate">{current.speaker}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-xs font-mono text-[#fefefc]/60 shrink-0 hidden md:block">
                    <span className="text-[#fefefc]">{formatTime(currentTime)}</span>
                    <span className="mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => skipSeconds(-10)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#fefefc]/70 hover:text-[#fefefc]"
                      title="Back 10s"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={toggle}
                      className={cn(
                        "p-3 rounded-full transition-all active:scale-90",
                        "bg-[#c8a84e] hover:bg-[#b8983e] text-[#0d5844]",
                        "shadow-lg shadow-[#c8a84e]/30"
                      )}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => skipSeconds(10)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#fefefc]/70 hover:text-[#fefefc]"
                      title="Forward 10s"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="items-center gap-2 shrink-0 hidden lg:flex">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-[#fefefc]/70 hover:text-[#fefefc]"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 accent-[#c8a84e] cursor-pointer"
                      title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                    />
                  </div>

                  {/* Collapse & Close */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#fefefc]/50 hover:text-[#fefefc]"
                      title="Minimize"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={stop}
                      className="p-2 rounded-full hover:bg-red-500/20 transition-colors text-[#fefefc]/50 hover:text-red-400"
                      aria-label="Close player"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed mini strip */}
          {isCollapsed && (
            <div className="py-2 flex items-center gap-3">
              <WaveformBars isPlaying={isPlaying} />
              <p className="flex-1 text-xs font-semibold truncate">{current.title}</p>
              <button
                onClick={toggle}
                className="p-1.5 rounded-full bg-[#c8a84e] text-[#0d5844] hover:bg-[#b8983e] transition-colors"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-[#fefefc]/70"
                title="Expand"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={stop}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-[#fefefc]/50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
