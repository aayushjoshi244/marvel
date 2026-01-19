"use client";

import { use, useEffect } from "react";
import { useWatchedStore } from "@/store/useWatchedStore";

export default function WatchedHydrator() {
    const hydrate = useWatchedStore((s) => s.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return null;
}