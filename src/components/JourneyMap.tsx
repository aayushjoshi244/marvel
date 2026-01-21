"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { titles, type Title } from "@/data/titles";
import { useJourney } from "@/store/journey";

type PhaseKey =
  | "UNSORTED"
  | "PHASE_1"
  | "PHASE_2"
  | "PHASE_3"
  | "PHASE_4"
  | "PHASE_5"
  | "PHASE_6";

type PhaseSection = {
  key: PhaseKey;
  title: string;
  subtitle: string;
  bg: string;
  filter: (t: Title) => boolean;
};

const PHASES: PhaseSection[] = [
  {
    key: "UNSORTED",
    title: "Prologue",
    subtitle: "The essentials before the saga locks in.",
    bg: "/journey/unsorted.jpg",
    filter: (t) => !t.phase || t.phase === 0,
  },
  {
    key: "PHASE_1",
    title: "Phase 1",
    subtitle: "The origin spark.",
    bg: "/journey/phase-1.jpg",
    filter: (t) => t.phase === 1,
  },
  {
    key: "PHASE_2",
    title: "Phase 2",
    subtitle: "The world expands.",
    bg: "/journey/phase-2.jpg",
    filter: (t) => t.phase === 2,
  },
  {
    key: "PHASE_3",
    title: "Phase 3",
    subtitle: "The war for everything.",
    bg: "/journey/phase-3.jpg",
    filter: (t) => t.phase === 3,
  },
  {
    key: "PHASE_4",
    title: "Phase 4",
    subtitle: "The multiverse booms",
    bg: "/journey/phase-4.jpg",
    filter: (t) => t.phase === 4,
  },
  {
    key: "PHASE_5",
    title: "Phase 5",
    subtitle: "The multiversal icidents.",
    bg: "/journey/phase-5.jpg",
    filter: (t) => t.phase === 5,
  },
  {
    key: "PHASE_6",
    title: "Phase 6",
    subtitle: "The doom effect comming.",
    bg: "/journey/phase-6.jpg",
    filter: (t) => t.phase === 6,
  },
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function JourneyDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/70 shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,0,0,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(255,0,0,0.10),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
        </div>

        <div className="relative p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] tracking-widest text-white/70">
            STRICT JOURNEY
          </div>

          <h3 className="mt-4 text-2xl font-semibold">That level is locked.</h3>

          <p className="mt-2 text-sm text-white/65">
            This journey is designed to be cleared step-by-step. If you want to
            watch freely, we’ll take you to the full Timeline.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/timeline"
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
            >
              Go to Timeline
            </Link>

            <button
              onClick={onClose}
              className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Stay on Journey
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

type Pt = { x: number; y: number };

function catmullRomPath(points: Pt[]) {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }

  return d.join(" ");
}

function PhasePath({
  items,
  currentIndexGlobal,
  watched,
  onLockedClick,
}: {
  items: Title[];
  currentIndexGlobal: number;
  watched: Record<string, boolean>;
  onLockedClick: () => void;
}) {
  const ordered = useMemo(
    () => [...items].sort((a, b) => a.recommendedOrder - b.recommendedOrder),
    [items]
  );

  const completedCount = ordered.filter((t) => watched[t.id]).length;
  const total = ordered.length;
  const progress = total ? completedCount / total : 0;

  // ---- SIZING (fits for large phases) ----
  const BOX = 520;
  const cx = BOX / 2;
  const cy = BOX / 2;

  // smaller nodes when lots of items
  const nodeSize = total >= 30 ? 44 : total >= 22 ? 50 : 56;
  const safeMargin = 18 + nodeSize / 2;
  const maxR = cx - safeMargin;

  // Spiral shape control:
  // turns: how many loops; radius grows from minR -> maxR
  const turns = total >= 28 ? 2.8 : total >= 20 ? 2.4 : 2.0;
  const minR = 92; // keep centre clear for the core ring

  const pts: Pt[] = useMemo(() => {
    if (total === 0) return [];
    if (total === 1) return [{ x: cx, y: cy - minR }];

    const out: Pt[] = [];
    for (let i = 0; i < total; i++) {
      const t = i / (total - 1); // 0..1
      const angle = -Math.PI / 2 + t * turns * Math.PI * 2;
      const r = minR + t * (maxR - minR);

      out.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
    return out;
  }, [total, cx, cy, minR, maxR, turns]);

  const spiralD = useMemo(() => catmullRomPath(pts), [pts]);

  return (
    <div className="mt-10 flex justify-center">
      <div className="relative" style={{ width: BOX, height: BOX }}>
        {/* ===== CURVATURE / ORBIT LINE ===== */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {/* soft glow */}
          <path
            d={spiralD}
            fill="none"
            stroke="rgba(239,68,68,0.18)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* crisp line */}
          <path
            d={spiralD}
            fill="none"
            stroke="rgba(239,68,68,0.35)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* ===== VAULT CORE ===== */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="absolute h-[260px] w-[260px]">
            <circle
              cx="130"
              cy="130"
              r="112"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
              fill="none"
            />
            <circle
              cx="130"
              cy="130"
              r="112"
              stroke="rgba(239,68,68,0.75)"
              strokeWidth="14"
              fill="none"
              strokeDasharray={`${progress * 2 * Math.PI * 112} ${2 * Math.PI * 112}`}
              strokeLinecap="round"
              transform="rotate(-90 130 130)"
              className="drop-shadow-[0_0_18px_rgba(239,68,68,0.6)]"
            />
          </svg>

          <div className="relative h-28 w-28 rounded-full bg-black">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.45),transparent_60%)]" />
            <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_40px_rgba(239,68,68,0.35)]" />
            <div className="relative flex h-full w-full flex-col items-center justify-center text-center">
              <span className="text-[11px] tracking-widest text-white/60">PHASE CORE</span>
              <span className="mt-1 text-sm font-semibold">{Math.round(progress * 100)}%</span>
            </div>
          </div>
        </div>

        {/* ===== NODES ===== */}
        {ordered.map((t, i) => {
          const p = pts[i];
          if (!p) return null;

          const isWatched = !!watched[t.id];
          const isNext = !isWatched && t.recommendedOrder === currentIndexGlobal;
          const isLocked = !isWatched && t.recommendedOrder > currentIndexGlobal;

          const ring = isNext
            ? "ring-2 ring-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.6)]"
            : isWatched
            ? "ring-1 ring-emerald-400/40"
            : "ring-1 ring-white/10";

          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: isLocked ? 1 : 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (isLocked) onLockedClick();
                else window.location.href = `/title/${t.id}`;
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${ring}
                rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition`}
              style={{
                left: p.x,
                top: p.y,
                width: nodeSize,
                height: nodeSize,
                borderRadius: 14,
              }}
              title={t.name}
            >
              <div className="absolute inset-0 opacity-85">
                <Image
                  src={t.posterSrc}
                  alt=""
                  fill
                  sizes="64px"
                  className={`object-cover ${isLocked ? "blur-[2px] opacity-30" : "opacity-80"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
              </div>

              <div className="relative grid h-full w-full place-items-center">
                {isWatched ? (
                  <span className="text-xs font-semibold text-emerald-300">✓</span>
                ) : isNext ? (
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full bg-red-500"
                    animate={{
                      boxShadow: [
                        "0 0 0px rgba(239,68,68,0.0)",
                        "0 0 18px rgba(239,68,68,0.55)",
                        "0 0 0px rgba(239,68,68,0.0)",
                      ],
                    }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                ) : (
                  <span className="text-[10px] text-white/60">•</span>
                )}
              </div>

              {isLocked && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


export default function JourneyMap() {
  const watched = useJourney((s) => s.watched);
  const [lockedDialog, setLockedDialog] = useState(false);

  // Global order (campaign order)
  const ordered = useMemo(() => {
    return [...titles].sort((a, b) => a.recommendedOrder - b.recommendedOrder);
  }, []);

  // current “level” = first un-watched in global order
  const currentOrder = useMemo(() => {
    const next = ordered.find((t) => !watched[t.id]);
    return next?.recommendedOrder ?? (ordered.at(-1)?.recommendedOrder ?? 1);
  }, [ordered, watched]);

  const completed = useMemo(() => {
    let c = 0;
    for (const t of ordered) if (watched[t.id]) c++;
    return c;
  }, [ordered, watched]);

  const total = ordered.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* global background */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,0,0,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,0,0,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/65 to-black" />
      </div>

      <JourneyDialog open={lockedDialog} onClose={() => setLockedDialog(false)} />

      <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-12">
        <Link href="/" className="text-sm text-white/60 hover:text-white/85">
          ← Back to Home
        </Link>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/70">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Strict campaign journey
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">
              Start the Marvelous Journey
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/65">
              Clear the path level-by-level. Your next step is always
              highlighted. If you want to watch freely, use the Timeline.
            </p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Progress</span>
              <span>
                {completed}/{total} ({pct}%)
              </span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-red-600 transition-all"
                style={{ width: `${clamp(pct, 0, 100)}%` }}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                href="/timeline"
                className="flex-1 rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Timeline
              </Link>

              <button
                onClick={() => {
                  const next = ordered.find((t) => !watched[t.id]);
                  if (next) window.location.href = `/title/${next.id}`;
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
              >
                Next Level
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Phase sections */}
      {PHASES.map((ph) => {
        const list = ordered.filter(ph.filter);
        if (!list.length) return null;

        return (
          <section key={ph.key} className="relative mx-auto max-w-6xl px-6 pb-16">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
              {/* blended background */}
              <div className="absolute inset-0">
                <Image
                  src={ph.bg}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 1100px"
                  priority={ph.key === "PHASE_1"}
                  className="object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />
              </div>

              <div className="relative p-7 md:p-10">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] tracking-widest text-white/70">
                      JOURNEY LANE
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                      {ph.title}
                    </h2>

                    <p className="mt-2 text-sm text-white/65">{ph.subtitle}</p>
                  </div>

                  <div className="text-xs text-white/60">{list.length} levels</div>
                </div>

                <PhasePath
                  items={list}
                  currentIndexGlobal={currentOrder}
                  watched={watched}
                  onLockedClick={() => setLockedDialog(true)}
                />
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
