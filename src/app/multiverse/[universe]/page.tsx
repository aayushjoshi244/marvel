import Link from "next/link";
import { notFound } from "next/navigation";
import PosterCard from "@/components/PosterCard";
import { titles } from "@/data/titles";
import { universeToSlug } from "@/lib/routeSlugs";

export function generateStaticParams() {
  const set = new Set<string>();
  for (const t of titles) set.add(universeToSlug(t.universe));
  return Array.from(set).map((universe) => ({ universe }));
}

export default async function UniverseDetailPage({
  params,
}: {
  params: Promise<{ universe: string }>;
}) {
  const { universe: universeSlug } = await params;
  const universe = decodeURIComponent(universeSlug);

  const list = titles
    .filter((t) => t.universe === universe)
    .sort((a, b) => a.recommendedOrder - b.recommendedOrder);

  if (list.length === 0) return notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        <Link
          href="/multiverse"
          className="text-sm text-white/60 hover:text-white/85"
        >
          ← Back to Multiverse
        </Link>

        <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{universe}</h1>
        <p className="mt-3 text-white/65">{list.length} titles</p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {list.map((t, idx) => (
            <PosterCard
              key={t.id}
              id={t.id}
              title={t.name}
              badge={t.type.toUpperCase()}
              posterSrc={t.posterSrc}
              href={`/title/${t.id}`}
              priority={idx < 2}
              trailerMutedPreviewSrc={t.trailerMutedPreviewSrc}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
