"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useWatchedStore } from "@/store/useWatchedStore";
import PosterCard from "@/components/PosterCard";
import type { Title } from "@/data/titles";

type Group = { phase: number; list: Title[] };

function pct(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export default function TimelineProgressShell({ grouped }: { grouped: Group[] }) {
  const watched = useWatchedStore((s) => s.watched);
  const hydrate = useWatchedStore((s) => (s as any).hydrate); // in case you added hydrate
  const isHydrated = useWatchedStore((s) => (s as any).isHydrated);

  useEffect(() => {
    if (typeof hydrate === "function") hydrate();
  }, [hydrate]);

  // Total titles in the current view (respects filters)
  const totalTitles = useMemo(
    () => grouped.reduce((acc, g) => acc + g.list.length, 0),
    [grouped],
  );

  const watchedCount = useMemo(() => {
    let c = 0;
    for (const g of grouped) for (const t of g.list) if (watched[t.id]) c++;
    return c;
  }, [grouped, watched]);

  const globalPercent = pct(watchedCount, totalTitles);

  const phaseStats = useMemo(() => {
    return grouped.map((g) => {
      const total = g.list.length;
      const done = g.list.reduce((acc, t) => acc + (watched[t.id] ? 1 : 0), 0);
      const percent = pct(done, total);
      const nextUp = g.list.find((t) => !watched[t.id]) ?? null;
      const complete = total > 0 && done >= total;
      return { phase: g.phase, total, done, percent, nextUp, complete, list: g.list };
    });
  }, [grouped, watched]);

  const globalNext = useMemo(() => {
    for (const g of phaseStats) {
      if (g.nextUp) return g.nextUp;
    }
    return null;
  }, [phaseStats]);

  return (
    <>
      {/* Sticky "Next up" */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs tracking-widest text-white/60">NEXT UP</p>
            <p className="text-sm font-semibold text-white/90">
              {/* avoid weird flash if your store hydrates */}
              {typeof isHydrated === "boolean" && !isHydrated
                ? "Loading your progress…"
                : globalNext
                  ? globalNext.name
                  : "All caught up. You're worthy."}
            </p>
          </div>

          <div className="w-[180px]">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
              {/* Animated global progress */}
              <motion.div
                className="absolute left-0 top-0 h-full bg-red-500/70"
                initial={{ width: 0 }}
                animate={{ width: `${globalPercent}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />

              {/* Endgame pulse when EVERYTHING complete */}
              {globalPercent === 100 && totalTitles > 0 && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.35, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background:
                      "radial-gradient(800px circle at 50% 50%, rgba(255,255,255,0.16), rgba(255,0,0,0.10), transparent 60%)",
                  }}
                />
              )}
            </div>

            <p className="mt-1 text-[11px] text-white/50">
              {watchedCount}/{totalTitles} watched • {globalPercent}%
            </p>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-12 pt-8">
        {phaseStats.map(({ phase, list, done, total, percent, complete }) => (
          <div key={phase || 0}>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {phase === 0 ? "Unsorted" : `Phase ${phase}`}
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  {done}/{total} completed • {percent}%
                </p>
              </div>

              {/* Phase progress bar (animated + Endgame pulse when complete) */}
              <div className="w-[260px]">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-green-500/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />

                  {complete && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.35, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        background:
                          "radial-gradient(700px circle at 50% 50%, rgba(255,255,255,0.14), rgba(16,185,129,0.12), transparent 60%)",
                      }}
                    />
                  )}
                </div>

                {complete && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Completed
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {list.map((t, idx) => (
                <PosterCard
                  key={t.id}
                  id={t.id}
                  title={t.name}
                  badge={t.type.toUpperCase()}
                  posterSrc={t.posterSrc}
                  href={`/title/${t.id}`}
                  priority={idx < 5}
                  trailerMutedPreviewSrc={t.trailerMutedPreviewSrc}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
