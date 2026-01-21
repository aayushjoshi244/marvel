"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { titles } from "@/data/titles";
import { useJourney } from "@/store/journey";

type LaneKey =
  | "prologue"
  | "phase1"
  | "phase2"
  | "phase3"
  | "phase4"
  | "phase5"
  | "phase6";

type Lane = {
  key: LaneKey;
  label: string;
  subtitle: string;
  bg: string;
  filter: (t: (typeof titles)[number]) => boolean;
};

const LANES: Lane[] = [
  { key: "prologue", label: "Prologue", subtitle: "The essentials before the saga locks in.", bg: "/posters/blade-1998.jpg", filter: (t) => t.phase == null },
  { key: "phase1", label: "Phase 1", subtitle: "The origin spark.", bg: "/posters/the-avengers-2012.jpg", filter: (t) => t.phase === 1 },
  { key: "phase2", label: "Phase 2", subtitle: "The world expands.", bg: "/posters/avengers-age-of-ultron-2015.jpg", filter: (t) => t.phase === 2 },
  { key: "phase3", label: "Phase 3", subtitle: "The endgame pressure.", bg: "/posters/avengers-endgame-2019.jpg", filter: (t) => t.phase === 3 },
  { key: "phase4", label: "Phase 4", subtitle: "Cracks in reality.", bg: "/posters/spider-man-no-way-home-2021.jpg", filter: (t) => t.phase === 4 },
  { key: "phase5", label: "Phase 5", subtitle: "Variants. Consequences.", bg: "/posters/deadpool-and-wolverine-2024.jpg", filter: (t) => t.phase === 5 },
  { key: "phase6", label: "Phase 6", subtitle: "The road to collision.", bg: "/posters/fantastic-four-2025.jpg", filter: (t) => t.phase === 6 },
];

// Geometry (tune these)
const NODE = 58;
const GAP_X = 16;
const GAP_Y = 54;
const PAD = 28;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useMeasureWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setW(Math.floor(rect.width));
    });

    ro.observe(el);
    // initial
    setW(Math.floor(el.getBoundingClientRect().width));

    return () => ro.disconnect();
  }, []);

  return { ref, w };
}

type Level = (typeof titles)[number] & {
  globalIndex: number;
  laneIndex: number;
  laneKey: LaneKey;
};

export default function JourneyCampaign() {
  const { watched, hydrate } = useJourney();
  useEffect(() => hydrate(), [hydrate]);

  const ordered: Level[] = useMemo(() => {
    const sorted = titles.slice().sort((a, b) => a.recommendedOrder - b.recommendedOrder);
    return sorted.map((t, i) => {
      const lane = LANES.find((l) => l.filter(t)) ?? LANES[0];
      return {
        ...t,
        globalIndex: i,
        laneIndex: LANES.findIndex((x) => x.key === lane.key),
        laneKey: lane.key,
      };
    });
  }, []);

  const total = ordered.length;
  const nextIndex = useMemo(() => ordered.findIndex((t) => !watched[t.id]), [ordered, watched]);
  const safeNextIndex = nextIndex === -1 ? total : nextIndex;
  const progress = total === 0 ? 0 : Math.round((safeNextIndex / total) * 100);
  const nextLevel = safeNextIndex < total ? ordered[safeNextIndex] : null;

  // One container that drives BOTH grid + svg coordinate space
  const { ref: boxRef, w: boxW } = useMeasureWidth<HTMLDivElement>();

  // derive columns from available width
  const cols = useMemo(() => {
    if (!boxW) return 10;
    const usable = boxW - PAD * 2;
    const per = Math.floor((usable + GAP_X) / (NODE + GAP_X));
    return clamp(per, 5, 14);
  }, [boxW]);

  // build snake rows (continuous)
  const rows = useMemo(() => {
    const r: Level[][] = [];
    for (let i = 0; i < ordered.length; i += cols) {
      const chunk = ordered.slice(i, i + cols);
      const rowIdx = r.length;
      r.push(rowIdx % 2 === 0 ? chunk : chunk.slice().reverse());
    }
    return r;
  }, [ordered, cols]);

  // --- Background blending based on “current lane of nextIndex”
  const activeLaneIdx = useMemo(() => {
    if (safeNextIndex >= total) return LANES.length - 1;
    return ordered[safeNextIndex]?.laneIndex ?? 0;
  }, [ordered, safeNextIndex, total]);

  // --- Build node centers in ONE coordinate system (0..W, 0..H)
  const W = Math.max(boxW || 0, 1);
  const rowH = NODE + GAP_Y;

  const nodeCenters = useMemo(() => {
    const pts: Array<{ x: number; y: number; level: Level }> = [];
    rows.forEach((row, rowIdx) => {
      // IMPORTANT: always compute x positions based on column index within full cols grid,
      // so the snake fills the full width and turns are consistent.
      row.forEach((level, colIdx) => {
        const x = PAD + colIdx * (NODE + GAP_X) + NODE / 2;
        const y = PAD + rowIdx * rowH + NODE / 2;
        pts.push({ x, y, level });
      });
    });

    // ensure connection order = globalIndex ascending
    pts.sort((a, b) => a.level.globalIndex - b.level.globalIndex);
    return pts;
  }, [rows, rowH]);

  const H = useMemo(() => PAD * 2 + rows.length * rowH, [rows.length, rowH]);

  // --- Clean snake path with rounded turns
  const pathD = useMemo(() => {
    if (nodeCenters.length < 2) return "";

    const R = 22; // corner radius
    const pts = nodeCenters;

    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];

      const sameRow = Math.abs(a.y - b.y) < 0.5;

      if (sameRow) {
        // straight segment
        d += ` L ${b.x} ${b.y}`;
        continue;
      }

      // row change: we create a smooth “U-turn”:
      // go vertically to mid, curve, then to next
      const dirX = b.x > a.x ? 1 : -1;
      const midY = (a.y + b.y) / 2;

      // Approach to mid
      d += ` L ${a.x} ${midY - R}`;

      // Curve into horizontal direction
      d += ` Q ${a.x} ${midY}, ${a.x + dirX * R} ${midY}`;

      // Horizontal travel towards b.x - dirX*R
      d += ` L ${b.x - dirX * R} ${midY}`;

      // Curve down/up into b
      d += ` Q ${b.x} ${midY}, ${b.x} ${midY + R}`;

      // Finish to node
      d += ` L ${b.x} ${b.y}`;
    }

    return d;
  }, [nodeCenters]);

  // strict click behaviour
  const [modal, setModal] = useState<{ open: boolean; tried?: string }>({ open: false });

  const onLevelClick = (lvl: Level) => {
    const isWatched = Boolean(watched[lvl.id]);
    const isNext = lvl.globalIndex === safeNextIndex;

    if (isWatched || isNext) {
      window.location.href = `/title/${lvl.id}`;
      return;
    }

    setModal({ open: true, tried: lvl.name });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Blended background (smooth, lane vibe) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {LANES.map((l, idx) => (
          <div
            key={l.key}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === activeLaneIdx ? 1 : 0 }}
          >
            <Image
              src={l.bg}
              alt=""
              fill
              priority={idx === 0}
              className="object-cover opacity-[0.24]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/65 to-black" />
          </div>
        ))}
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pt-10 pb-8">
        <Link href="/" className="text-sm text-white/60 hover:text-white/80">
          ← Back to Home
        </Link>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Strict campaign journey
        </div>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Start the Marvelous
              <span className="block">Journey</span>
            </h1>
            <p className="mt-4 text-base text-white/65">
              Clear the path level-by-level. Your next step is always highlighted.
              If you want to watch freely, use the Timeline.
            </p>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur md:w-[520px]">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Progress</span>
              <span>
                {safeNextIndex}/{total} ({progress}%)
              </span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-red-600 transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                href="/timeline"
                className="flex-1 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Timeline
              </Link>

              <button
                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-40"
                disabled={!nextLevel}
                onClick={() => nextLevel && (window.location.href = `/title/${nextLevel.id}`)}
              >
                Next Level
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ONE box: svg + grid aligned */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div
          ref={boxRef}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/25 backdrop-blur"
          style={{ padding: PAD }}
        >
          {/* top lane label */}
          <div className="pointer-events-none absolute left-6 top-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {LANES[activeLaneIdx]?.label} — {LANES[activeLaneIdx]?.subtitle}
            </div>
          </div>

          {/* svg track (RESPONSIVE via viewBox + 100% width) */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
          >
            <path d={pathD} fill="none" stroke="rgba(255,0,0,0.22)" strokeWidth={10} />
            <path d={pathD} fill="none" stroke="rgba(255,0,0,0.62)" strokeWidth={2.4} />
          </svg>

          {/* nodes grid */}
          <div className="relative">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, ${NODE}px)`,
                  columnGap: GAP_X,
                  marginBottom: GAP_Y,
                }}
              >
                {row.map((lvl) => {
                  const isWatched = Boolean(watched[lvl.id]);
                  const isNext = lvl.globalIndex === safeNextIndex;
                  const locked = !isWatched && !isNext;

                  return (
                    <button
                      key={lvl.id}
                      onClick={() => onLevelClick(lvl)}
                      className={[
                        "relative rounded-2xl border transition",
                        "border-white/10 bg-white/5 backdrop-blur",
                        isNext ? "ring-2 ring-red-500/80 shadow-[0_0_40px_rgba(255,0,0,0.35)]" : "",
                        locked ? "opacity-55 hover:opacity-70" : "opacity-95 hover:opacity-100",
                      ].join(" ")}
                      style={{ width: NODE, height: NODE }}
                      title={lvl.name}
                    >
                      <Image
                        src={lvl.posterSrc}
                        alt=""
                        fill
                        className={[
                          "rounded-2xl object-cover",
                          locked ? "opacity-25 blur-[1px]" : "opacity-70",
                        ].join(" ")}
                        sizes="58px"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/10 via-black/35 to-black/75" />

                      {/* dot */}
                      <div className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-white/25">
                        {isNext && <div className="h-2.5 w-2.5 rounded-full bg-red-500" />}
                        {isWatched && <div className="h-2.5 w-2.5 rounded-full bg-white/70" />}
                      </div>
                    </button>
                  );
                })}

                {/* fill remaining cols to keep alignment */}
                {Array.from({ length: Math.max(0, cols - row.length) }).map((_, i) => (
                  <div key={`spacer-${rowIdx}-${i}`} style={{ width: NODE, height: NODE }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* strict dialog */}
      {modal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/75 p-6 backdrop-blur">
            <div className="text-lg font-semibold">Free will detected.</div>
            <p className="mt-2 text-sm text-white/65">
              This journey is strict. To jump around, use Timeline.
            </p>

            {modal.tried && (
              <p className="mt-3 text-xs text-white/45">
                You tried to open: <span className="text-white/75">{modal.tried}</span>
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                onClick={() => setModal({ open: false })}
              >
                Stay in Campaign
              </button>
              <Link
                href="/timeline"
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-semibold hover:bg-red-500"
              >
                Go Timeline
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
