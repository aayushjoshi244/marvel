import PosterCard from "@/components/PosterCard";
import ContinueJourney from "@/components/ContinueJourney";

const demo = [
  { title: "Iron Man", badge: "FILM", posterSrc: "/posters/ironman.jpg", href: "/ironman" },
  { title: "The Avengers", badge: "FILM", posterSrc: "/posters/avengers.jpg", href: "/avengers" },
  { title: "Loki: Season 1", badge: "TV", posterSrc: "/posters/loki-s1.jpg", href: "/loki-s1" },
  { title: "Spider-Man: Into the Spider-Verse", badge: "FILM", posterSrc: "/posters/spiderverse.jpg", href: "/spiderverse" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,0,0,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,0,0,0.10),transparent_45%)]" />
      </div>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Recommended path: Chronological Timeline
        </div>

        <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-6xl">
          Your Marvel watch journey,
          <span className="block text-white/70">done properly.</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base text-white/65">
          Explore the MCU timeline, jump into Sagas, or hop universes in the Multiverse.
          Posters, previews, and a clean “what’s next” flow.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/timeline"
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition"
          >
            Start Timeline
          </a>
          <a
            href="/sagas"
            className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/8 transition"
          >
            Explore Sagas
          </a>
          <a
            href="/multiverse"
            className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/8 transition"
          >
            Explore Multiverse
          </a>
        </div>
      </section>

      <ContinueJourney />
      
      {/* grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-white/90">Featured</h2>
          <span className="text-sm text-white/60">Hover posters for effects</span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {demo.map((item, idx) => (
            <PosterCard
          key={item.title}
          title={item.title}
          badge={item.badge}
          posterSrc={item.posterSrc}
          href={item.href}
          priority={idx < 2}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
