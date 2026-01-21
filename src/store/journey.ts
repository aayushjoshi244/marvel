"use client";

import { create } from "zustand";

type State = {
  watched: Record<string, boolean>;
  hydrated: boolean;
  toggleWatched: (id: string) => void;
  hydrate: () => void;
};

const KEY = "marvel_journey_watched_v1";

export const useJourney = create<State>((set, get) => ({
  watched: {},
  hydrated: false,

  toggleWatched: (id) => {
    const curr = get().watched;
    const next = { ...curr, [id]: !curr[id] };
    set({ watched: next });
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  },

  hydrate: () => {
    if (get().hydrated) return; // ✅ prevent repeated hydration
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) set({ watched: JSON.parse(raw), hydrated: true });
      else set({ hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
