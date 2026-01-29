"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type SoundCtx = {
  enabled: boolean;
  toggle: () => void;
  play: (name: "click" | "open") => void;
};

const Ctx = createContext<SoundCtx | null>(null);
const KEY = "marvel_journey_sound_v1";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  // 🔊 SFX sounds
  const sounds = useMemo(() => {
    if (typeof Audio === "undefined") return null;
    return {
      click: new Audio("/theme_music/doomsday_theme.mp3"),
      open: new Audio("/theme_music/doomsday_theme.mp3"),
    };
  }, []);

  // 🎵 GLOBAL BACKGROUND MUSIC (Avengers theme)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  // load persisted preference
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw != null) setEnabled(raw === "1");
    } catch {}
  }, []);

  // create background audio ONCE
  useEffect(() => {
    const a = new Audio("/theme_music/doomsday_theme.mp3");
    a.loop = true;
    a.volume = 0.85;
    a.muted = true; // autoplay-safe
    a.preload = "auto";
    bgAudioRef.current = a;

    return () => {
      a.pause();
      bgAudioRef.current = null;
    };
  }, []);
  // apply mute state to background music
  useEffect(() => {
    const bg = bgAudioRef.current;
    if (!bg) return;
    bg.muted = !enabled;
    if (!bg.muted && unlockedRef.current) {
      bg.play().catch(() => {});
    }
  }, [enabled]);

  // 🔓 unlock audio on first user interaction
  useEffect(() => {
    function unlock() {
      if (unlockedRef.current) return;
      unlockedRef.current = true;

      const bg = bgAudioRef.current;
      if (bg && enabled) {
        bg.muted = false;
        bg.play().catch(() => {});
      }

      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    }

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [enabled]);

  const value: SoundCtx = {
    enabled,
    toggle: () => {
      setEnabled((v) => {
        const next = !v;
        localStorage.setItem(KEY, next ? "1" : "0");

        const bg = bgAudioRef.current;
        if (bg) {
          bg.muted = !next;
          if (next && unlockedRef.current) bg.play().catch(() => {});
          if (!next) bg.pause();
        }

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
