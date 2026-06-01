import { create } from "zustand";

export type NowPlaying = {
  id: string;
  title: string;
  titleUrdu?: string;
  audioUrl: string;
  speaker?: string;
  thumbnail?: string;
};

type AudioStore = {
  current: NowPlaying | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: (track: NowPlaying) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  current: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  play: (track) => set({ current: track, isPlaying: true, currentTime: 0, duration: 0 }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ current: null, isPlaying: false, currentTime: 0, duration: 0 }),
  toggle: () => {
    const { isPlaying, current } = get();
    if (!current) return;
    set({ isPlaying: !isPlaying });
  },
  setVolume: (v) => set({ volume: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
}));
