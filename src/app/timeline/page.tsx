import FiltersBar from "@/components/FiltersBar";
import { titles } from "@/data/titles";
import BackButton from "@/components/BackButton";
import { devDeplay } from "@/lib/devDeplay";
import TimelineProgressShell from "@/components/TimelineProgressShell";

function groupByPhase(items: typeof titles) {
  const map = new Map<number, typeof titles>();
  for (const t of items) {
    const ph = t.phase ?? 0;
    if (!map.has(ph)) map.set(ph, []);
    map.get(ph)!.push(t);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([phase, list]) => ({
      phase,
      list: list.sort((a, b) => a.recommendedOrder - b.recommendedOrder),
    }));
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; phase?: string; q?: string }>;
}) {
  await devDeplay(4000);

  const sp = await searchParams; // ✅ unwrap Promise

  const type = sp.type ?? "all";
  const phase = sp.phase ?? "all";
  const q = (sp.q ?? "").toLowerCase();

  let filtered = titles.slice();

  if (type !== "all") filtered = filtered.filter((t) => t.type === type);
  if (phase !== "all")
    filtered = filtered.filter((t) => String(t.phase ?? "") === phase);
  if (q) filtered = filtered.filter((t) => t.name.toLowerCase().includes(q));

  const grouped = groupByPhase(filtered);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <BackButton
          className="
      inline-flex items-center gap-2
      rounded-full border border-white/10
      bg-white/5 px-4 py-2
      text-sm text-white/80
      hover:bg-white/10
      transition
    "
          fallbackHref="/timeline"
        />
      </div>

      {/* ...rest unchanged... */}
      <FiltersBar />
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-8">
        {grouped.length === 0 ? (
          <p className="text-white/60">No results. Try clearing filters.</p>
        ) : (
          <TimelineProgressShell grouped={grouped} />
        )}
      </section>
    </main>
  );
}
