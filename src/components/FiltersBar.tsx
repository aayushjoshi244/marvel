"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";

const typeOptions = ["all", "film", "show", "oneShot", "special", "short"];
const phaseOptions = ["all", "1", "2", "3", "4", "5", "6"] as const;

export default function FiltersBar() {
    const sp = useSearchParams();
    const router = useRouter();

    const type = sp.get("type") || "all";
    const phase = sp.get("phase") || "all";
    const q = sp.get("q") ?? ""; 

    function setParam(key: string, val: string) {
        const params = new URLSearchParams(sp.toString());
        if (val == "all" || val == "") params.delete(key);
        else params.set(key, val);
        router.replace(`/timeline?${params.toString()}`, { scroll: false });
    }

   return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 flex-wrap">
          {typeOptions.map((t) => (
            <button
              key={t}
              onClick={() => setParam("type", t)}
              className={[
                "rounded-full px-3 py-1 text-xs border transition",
                type === t
                  ? "border-red-500/40 bg-red-600/15 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
              ].join(" ")}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {phaseOptions.map((p) => (
              <button
                key={p}
                onClick={() => setParam("phase", p)}
                className={[
                  "rounded-full px-3 py-1 text-xs border transition",
                  phase === p
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                ].join(" ")}
              >
                {p === "all" ? "ALL PHASES" : `PHASE ${p}`}
              </button>
            ))}
          </div>

          <input
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search…"
            className="ml-2 hidden md:block w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 outline-none focus:border-red-500/40"
          />
        </div>
      </div>
    </div>
  );
}