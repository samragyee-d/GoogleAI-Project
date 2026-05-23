"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateJourney() {
  const router = useRouter();

  const [fanType, setFanType] = useState("Groundhopper");
  const [budget, setBudget] = useState("5000");
  const [preferredTeam, setPreferredTeam] = useState("Argentina");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/trips", {
      method: "POST",
      body: JSON.stringify({
        fanType,
        budget,
        preferredTeam,
      }),
    });

    router.push("/dashboard");
  }

  return (
    <main className="p-8 max-w-lg">
      <h1 className="text-3xl font-bold">Create Journey</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <select
          value={fanType}
          onChange={(e) => setFanType(e.target.value)}
          className="w-full border p-2"
        >
          <option>Local</option>
          <option>Traveler</option>
          <option>Groundhopper</option>
        </select>

        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget"
          className="w-full border p-2"
        />

        <input
          value={preferredTeam}
          onChange={(e) => setPreferredTeam(e.target.value)}
          placeholder="Preferred Team"
          className="w-full border p-2"
        />

        <button className="rounded bg-black px-4 py-2 text-white">
          Create Journey
        </button>
      </form>
    </main>
  );
}