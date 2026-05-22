import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">CupCompass</h1>
      <p className="mt-2">Agentic World Cup journey manager.</p>

      <Link
        href="/create"
        className="inline-block mt-6 rounded bg-black px-4 py-2 text-white"
      >
        Create Journey
      </Link>
    </main>
  );
}