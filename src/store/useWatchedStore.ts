"use client";

import { create } from "zustand";

type WatchedState = {
    watched: Record<string, boolean>;
    toggleWatched: (id: string) => void;
    isWatched: (id: string) => boolean;
    hydrate: () => void;
}

const KEY = "marvel_journey_watched_v1";

export const useWatchedStore = create<WatchedState>((set, get) => ({
  watched: {},

  toggleWatched: (id) => {
    const curr = get().watched;
    const next = { ...curr, [id]: !curr[id] };
    set({ watched: next });

    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  },

  isWatched: (id) => !!get().watched[id],

  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      set({ watched: JSON.parse(raw) });
    } catch {}
  },
}));