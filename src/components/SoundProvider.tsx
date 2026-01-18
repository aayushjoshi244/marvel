"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SoundCtx = {
  enabled: boolean;
  toggle: () => void;
  play: (name: "click" | "open") => void;
};

const Ctx = createContext<SoundCtx | null>(null);
const KEY = "marvel_journey_sound_v1";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw != null) setEnabled(raw === "1");
    } catch {}
  }, []);

  const sounds = useMemo(() => {
    if (typeof Audio === "undefined") return null;
    return {
      click: new Audio("/sfx/click.mp3"),
      open: new Audio("/sfx/open.mp3"),
    };
  }, []);

  const value: SoundCtx = {
    enabled,
    toggle: () => {
      setEnabled((v) => {
        const next = !v;
        localStorage.setItem(KEY, next ? "1" : "0");
        return next;
      });
    },
    play: (name) => {
      if (!enabled || !sounds) return;
      const a = sounds[name];
      a.currentTime = 0;
      a.volume = 0.25;
      a.play().catch(() => {});
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSound must be used inside SoundProvider");
  return v;
}
