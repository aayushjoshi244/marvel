import FiltersBar from "@/components/FiltersBar";
import PosterCard from "@/components/PosterCard";
import { titles } from "@/data/titles";

function groupByPhase(items: typeof titles) {
    const map = new Map<number, typeof titles>();
    for (const t of items) {
        const ph = t.phase ?? 0;
        if (!map.has(ph)) map.set(ph, []);
        map.get(ph)!.push(t);
    }
    return [...map.entries()]
        .sort((a,b) => a[0] - b[0])
        .map(([phase, list]) => ({
            phase,
            list: list.sort((a,b) => a.recommendedOrder - b.recommendedOrder)
        }));
}

export default function TimelinePage({
    searchParams,
}: {
    searchParams: { type?: string; phase?: string; q?: string};
}) {
    const type = searchParams.type ?? "all";
    const phase = searchParams.phase ?? "all";
    const q = (searchParams.q ?? "").toLowerCase();

    let filtered = titles.slice();

    if(type !== "all") filtered = filtered.filter((t) => t.type === type);
    if (phase !== "all") filtered = filtered.filter((t) => String(t.phase ?? "") === phase);
    if (q) filtered = filtered.filter((t) => t.name.toLowerCase().includes(q));

    const grouped = groupByPhase(filtered);

    return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-35">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,0,0,0.16),transparent_45%),radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(255,0,0,0.10),transparent_50%)]" />
      </div>

      <header className="relative mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Recommended: Chronological Timeline
        </div>
        <h1 className="mt-5 text-3xl md:text-5xl font-semibold">
          MCU Timeline
          <span className="block text-white/60 text-base md:text-lg mt-2">
            Phase headers, sticky filters, cinematic cards.
          </span>
        </h1>
      </header>

      <FiltersBar />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-8">
        {grouped.length === 0 ? (
          <p className="text-white/60">No results. Try clearing filters.</p>
        ) : (
          <div className="space-y-12">
            {grouped.map(({ phase, list }) => (
              <div key={phase || 0}>
                <div className="mb-5 flex items-end justify-between">
                  <h2 className="text-xl font-semibold">
                    {phase === 0 ? "Unsorted" : `Phase ${phase}`}
                    <span className="ml-3 text-sm text-white/50">
                      ({list[0]?.universe ?? "Earth-?"})
                    </span>
                  </h2>
                  <span className="text-sm text-white/50">{list.length} titles</span>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  {list.map((t, idx) => (
                    <PosterCard
                      key={t.id}
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
        )}
      </section>
    </main>
  );
}