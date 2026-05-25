"use client";

import { useRouter } from "next/navigation";

export default function SimulationButtons({ tripId }: { tripId: string }) {
  const router = useRouter();

  async function simulate(eventType: string) {
    await fetch("/api/simulate", {
      method: "POST",
      body: JSON.stringify({ tripId, eventType }),
    });

    router.refresh();
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">Simulations</h2>

      <div className="mt-3 flex gap-3">
        <button onClick={() => simulate("hotel_cancelled")} className="rounded bg-black px-4 py-2 text-white">
          Hotel Cancellation
        </button>

        <button onClick={() => simulate("match_advanced")} className="rounded bg-black px-4 py-2 text-white">
          Match Advancement
        </button>

        <button onClick={() => simulate("budget_overrun")} className="rounded bg-black px-4 py-2 text-white">
          Budget Overrun
        </button>
      </div>
    </section>
  );
}