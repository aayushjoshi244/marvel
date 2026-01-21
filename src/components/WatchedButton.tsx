"use client";

import { useJourney } from "@/store/journey";

export default function WatchedButton({ id }: { id: string }) {
  const { watched, toggleWatched} = useJourney();

  const isWatched = !!watched[id];

  return (
    <button
      onClick={() => toggleWatched(id)}
      className={[
        "rounded-xl px-4 py-2 text-sm font-semibold border transition",
        isWatched
          ? "border-green-500/30 bg-green-600/15 text-white"
          : "border-white/12 bg-white/5 text-white/90 hover:bg-white/10",
      ].join(" ")}
    >
      {isWatched ? "Watched ✓" : "Mark as Watched"}
    </button>
  );
}
