import Link from "next/link";
import Image from "next/image";
import { titles } from "@/data/titles";
import { slugToSaga, type SagaSlug } from "@/lib/routeSlugs";

const SAGAS: Array<{
  key: SagaSlug;
  title: string;
  subtitle: string;
  poster: string;
}> = [
  {
    key: "infinity",
    title: "Infinity Saga",
    subtitle: "Stones. Sacrifice. Endgame.",
    poster: "/posters/avengers-endgame-2019.jpg",
  },
  {
    key: "multiverse",
    title: "Multiverse Saga",
    subtitle: "Variants. Timelines. Collisions.",
    poster: "/posters/spider-man-no-way-home-2021.jpg",
  },
  {
    key: "legacy",
    title: "Legacy Saga",
    subtitle: "Before and beyond the MCU.",
    poster: "/posters/spider-man-2002.jpg",
  },
];

export default function SagasPage() {
  const counts = titles.reduce<Record<string, number>>((acc, t) => {
    acc[t.saga] = (acc[t.saga] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,0,0,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,0,0,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/65 to-black" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pt-14 pb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-semibold md:text-5xl">Explore Sagas</h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Watch by narrative arcs instead of strict time. Cinematic tiles,
          progress, and “what’s next” within each saga.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {SAGAS.map((s) => (
            <Link
              key={s.key}
              href={`/sagas/${s.key}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <div className="absolute inset-0 opacity-25 transition group-hover:opacity-35">
                <Image
                  src={s.poster}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

              <div className="relative p-7">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] tracking-widest text-white/70">
                    SAGA
                  </div>
                  <div className="text-xs text-white/60">
                    {counts[slugToSaga(s.key) ?? ""] ?? 0} titles
                  </div>
                </div>

                <div className="mt-4 text-2xl font-semibold">{s.title}</div>
                <div className="mt-2 text-sm text-white/65">{s.subtitle}</div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/85">
                  Enter <span className="opacity-70">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
