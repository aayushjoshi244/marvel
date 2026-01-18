import WatchedButton from "@/components/WatchedButton";

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
