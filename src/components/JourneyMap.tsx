"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { titles, type Title } from "@/data/titles";
import { useJourney } from "@/store/journey";
import TitleDetailsModal from "@/components/TitleDetailsModal";
import JourneyScene from "@/components/journey/JourneyScene";

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

export default function JourneyMap() {
  const router = useRouter();
  const watched = useJourney((s) => s.watched);
  const [lockedDialog, setLockedDialog] = useState(false);
  const hydrate = useJourney((s) => s.hydrate);
  const toggleWatched = useJourney((s) => s.toggleWatched);

  const [selected, setSelected] = useState<Title | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Global order (campaign order)
  const ordered = useMemo(() => {
    return [...titles].sort((a, b) => a.recommendedOrder - b.recommendedOrder);
  }, []);

  // current “level” = first un-watched in global order
  const currentOrder = useMemo(() => {
    const next = ordered.find((t) => !watched[t.id]);
    return next?.recommendedOrder ?? ordered.at(-1)?.recommendedOrder ?? 1;
  }, [ordered, watched]);

  const completed = useMemo(() => {
    let c = 0;
    for (const t of ordered) if (watched[t.id]) c++;
    return c;
  }, [ordered, watched]);

  const total = ordered.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const selectedIndex = selected
    ? ordered.findIndex((t) => t.id === selected.id)
    : -1;
  const nextTitle = selectedIndex >= 0 ? ordered[selectedIndex + 1] : null;
  const hasNext = !!nextTitle;

  return (
    <main className="relative h-screen w-full bg-black text-white overflow-hidden">
      {" "}
      {/* Ensure full screen and no scroll on body if using ScrollControls inside */}
      {/* 3D Scene */}
      <JourneyScene
        titles={ordered}
        watched={watched}
        currentOrder={currentOrder}
        onNodeClick={(t) => {
          setSelected(t);
          setDetailsOpen(true);
        }}
        onLockedClick={() => setLockedDialog(true)}
        started={started}
      />
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Header / Intro Section */}
        <motion.div
          layout
          className="absolute p-6 flex flex-col items-start"
          initial={{
            top: "30%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            scale: 1.2,
          }}
          animate={
            !started
              ? { top: "40%", left: "50%", x: "-50%", y: "-50%", scale: 1.2 }
              : { top: 0, left: 0, x: 0, y: 0, scale: 0.8 }
          }
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {!started && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex flex-col items-center text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Strict campaign journey
              </div>
            </motion.div>
          )}

          <div className={`${!started ? "text-center" : "text-left"}`}>
            {!started && (
              <Link
                href="/"
                className="mb-4 text-sm text-white/60 hover:text-white/85 pointer-events-auto inline-block"
              >
                ← Back to Home
              </Link>
            )}
            {started && (
              <Link
                href="/"
                className="text-sm text-white/60 hover:text-white/85 pointer-events-auto inline-block mb-2"
              >
                ← Exit
              </Link>
            )}

            <motion.h1
              layout="position"
              className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent md:text-6xl"
            >
              Cosmic Journey
            </motion.h1>

            {started && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/60 text-xs mt-1 max-w-xs"
              >
                Scroll to traverse
              </motion.p>
            )}

            {!started && (
              <motion.p className="mt-4 max-w-lg text-sm text-white/65 mx-auto">
                Clear the path level-by-level. Your next step is always
                highlighted. Begin your journey through the multiverse.
              </motion.p>
            )}

            {!started && (
              <div className="mt-8 pointer-events-auto">
                <button
                  onClick={() => setStarted(true)}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-white/90 transition shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  Enter Simulation
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats / HUD (Only visible after start) */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={started ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-24 right-6 pointer-events-auto bg-black/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 w-80"
        >
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Campaign Progress</span>
            <span>
              {completed}/{total} ({pct}%)
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 mb-4">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${clamp(pct, 0, 100)}%` }}
            />
          </div>

          <div className="flex gap-3">
            <Link
              href="/timeline"
              className="flex-1 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/90 transition hover:bg-white/10"
            >
              Timeline
            </Link>

            <button
              onClick={() => {
                const next = ordered.find((t) => !watched[t.id]);
                if (next) router.push(`/title/${next.id}`);
              }}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
            >
              Resume
            </button>
          </div>
        </motion.div>
      </div>
      <JourneyDialog
        open={lockedDialog}
        onClose={() => setLockedDialog(false)}
      />
      <TitleDetailsModal
        open={detailsOpen}
        title={selected}
        isWatched={selected ? !!watched[selected.id] : false}
        hasNext={hasNext}
        onClose={() => setDetailsOpen(false)}
        onToggleWatched={() => {
          if (!selected) return;
          toggleWatched(selected.id);
        }}
        onGoNext={() => {
          if (!nextTitle) return;

          // STRICT: do not allow skipping beyond the current campaign step
          // If nextTitle is not the currentOrder AND it's not already watched, block it.
          const isLocked =
            !watched[nextTitle.id] &&
            nextTitle.recommendedOrder !== currentOrder;
          if (isLocked) {
            setLockedDialog(true);
            return;
          }

          setSelected(nextTitle);
          setDetailsOpen(true);
        }}
      />
    </main>
  );
}
