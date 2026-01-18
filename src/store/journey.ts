"use client";
import { create } from "zustand";

type State = {
  watched: Record<string, boolean>;
  toggleWatched: (id: string) => void;
  hydrate: () => void;
};

const KEY = "marvel_journey_watched_v1";

export const useJourney = create<State>((set, get) => ({
  watched: {},
  toggleWatched: (id) => {
    const next = { ...get().watched, [id]: !get().watched[id] };
    set({ watched: next });
    localStorage.setItem(KEY, JSON.stringify(next));
  },
  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) set({ watched: JSON.parse(raw) });
    } catch {}
  },
}));
