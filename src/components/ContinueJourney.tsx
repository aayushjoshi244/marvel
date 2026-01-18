"use client";

import { use, useEffect, useMemo } from "react";
import Link from "next/link";
import { titles } from "@/data/titles";
import { useJourney } from "@/store/journey";

export default function ContinueJourney() {
    const { watched, hydrate} = useJourney();

    useEffect(() => hydrate(), [hydrate])

    const nextUp = useMemo(() => {
        const sorted = titles.slice().sort((a,b) => a.recommendedOrder - b.recommendedOrder);
        return sorted.find((t) => !watched[t.id]);
    }, [watched]);

    if (!nextUp) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/70">You’re caught up.</div>
                <div className="mt-1 text-white/90 font-semibold">Legend behavior.</div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs text-white/60 tracking-widest"> CONTINUE JOURNEY</div>
            <div className="mt-2 text-lg font-semibold">{nextUp.name}</div>
            <div className="mt-1 text-sm text-white/60">
                Next recommended in Chronological order
            </div>

            <div className="mt-4 flex gap-3">
                <Link
                    href={`/title/${nextUp.id}`}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500 transition"
                >
                    Open
                </Link>
                <Link
                    href="/timeline"
                    className="rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                >
                    View Timeline
                </Link>
            </div>
        </div>
    );
}