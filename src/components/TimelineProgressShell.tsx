"use client";

import { useMemo } from "react";
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

  const phaseStats = useMemo(() => {
    return grouped.map((g) => {
      const total = g.list.length;
      const done = g.list.filter((t) => watched[t.id]).length;
      const percent = pct(done, total);
      const nextUp = g.list.find((t) => !watched[t.id]) ?? null;
      return { phase: g.phase, total, done, percent, nextUp, list: g.list };
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
              {globalNext ? globalNext.name : "All caught up. You're worthy."}
            </p>
          </div>

          {globalNext && (
            <div className="w-[140px]">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-red-500/70"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (Object.values(watched).filter(Boolean).length /
                          Math.max(1, Object.keys(watched).length)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-white/50">
                Your journey progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-12 pt-8">
        {phaseStats.map(({ phase, list, done, total, percent }) => (
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

              {/* Phase progress bar */}
              <div className="w-[220px]">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-green-500/70"
                    style={{ width: `${percent}%` }}
                  />
                </div>
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
