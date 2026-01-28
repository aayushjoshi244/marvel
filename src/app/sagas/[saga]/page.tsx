import Link from "next/link";
import { notFound } from "next/navigation";
import PosterCard from "@/components/PosterCard";
import { titles, type Title } from "@/data/titles";
import { slugToSaga } from "@/lib/routeSlugs";
import  {devDeplay}  from "@/lib/devDeplay";
export function generateStaticParams() {
  return [
    { saga: "infinity" },
    { saga: "multiverse" },
    { saga: "legacy" },
  ];
}


export default async function SagaDetailPage({
  params,
}: {
  params: Promise<{ saga: string }>;
}) {
  await devDeplay(4000);

  const {saga:sagaSlug} = await params;

  const saga = slugToSaga(sagaSlug);
  if (!saga) return notFound();

  const list = titles
    .filter((t) => t.saga === saga)
    .sort((a, b) => a.recommendedOrder - b.recommendedOrder);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        <Link href="/sagas" className="text-sm text-white/60 hover:text-white/85">
          ← Back to Sagas
        </Link>

        <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{saga} Saga</h1>
        <p className="mt-3 text-white/65">
          {list.length} titles • ordered by recommended journey sequence
        </p>

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
