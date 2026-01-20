import WatchedButton from "@/components/WatchedButton";
import { titles } from "@/data/titles";

export function generateStaticParams() {
  return titles.map((t) => ({
    slug: t.id,
  }));
}

export default function TitlePage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-semibold">Title: {params.slug}</h1>
      <div className="mt-4">
        <WatchedButton id={params.slug} />
      </div>
    </main>
  );
}
