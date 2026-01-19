"use client";

import { create } from "zustand";

type WatchedState = {
  watched: Record<string, boolean>;
  isHydrated: boolean;

  toggleWatched: (id: string) => void;
  isWatched: (id: string) => boolean;

  hydrate: () => void;
  setWatched: (id: string, value: boolean) => void;
  markAllInList: (ids: string[], value: boolean) => void;
  reset: () => void;
};

const KEY = "marvel_journey_watched_v1";

function safeRead(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function safeWrite(next: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export const useWatchedStore = create<WatchedState>((set, get) => ({
  watched: {},
  isHydrated: false,

  hydrate: () => {
    const next = safeRead();
    set({ watched: next, isHydrated: true });
  },

  toggleWatched: (id) => {
    const curr = get().watched;
    const next = { ...curr, [id]: !curr[id] };
    set({ watched: next });
    safeWrite(next);
  },

  setWatched: (id, value) => {
    const curr = get().watched;
    const next = { ...curr, [id]: value };
    set({ watched: next });
    safeWrite(next);
  },

  markAllInList: (ids, value) => {
    const curr = get().watched;
    const next = { ...curr };
    for (const id of ids) next[id] = value;
    set({ watched: next });
    safeWrite(next);
  },

  reset: () => {
    set({ watched: {} });
    safeWrite({});
  },

  isWatched: (id) => !!get().watched[id],
}));

// Optional: auto-hydrate ONCE the first time this module is imported on client
// (prevents "empty state" flash everywhere)
if (typeof window !== "undefined") {
  // queueMicrotask is safe + avoids blocking
  queueMicrotask(() => {
    const s = useWatchedStore.getState();
    if (!s.isHydrated) s.hydrate();
  });
}
