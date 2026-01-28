import Image from "next/image";
import { notFound } from "next/navigation";
import { titles } from "@/data/titles";

function toYouTubeEmbed(url: string) {
  try {
    if (url.includes("/embed/")) return url;
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const t = titles.find((x) => x.id === id);
  if (!t) return notFound();

  const trailer = t.trailerUrl ? toYouTubeEmbed(t.trailerUrl) : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">{t.name}</h1>
          <p className="mt-2 text-white/60">
            {t.type.toUpperCase()}
            {t.phase ? ` • Phase ${t.phase}` : ""} • {t.saga} • {t.universe}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[320px_1fr]">
          <div className="w-full">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Image
                src={t.posterSrc}
                alt={t.name}
                width={700}
                height={1000}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            {t.watchUrl?.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-white/60">Watch on</p>
                <div className="flex flex-wrap gap-2">
                  {t.watchUrl.map((w) => (
                    <a
                      key={w.url}
                      href={w.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      {w.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">Synopsis</h2>
              <p className="mt-3 leading-relaxed text-white/80">
                {t.synopsis ?? "No synopsis added yet."}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">Trailer</h2>

              {trailer ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <div className="relative aspect-video w-full">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={trailer}
                      title={`${t.name} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-white/60">No trailer link added yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
