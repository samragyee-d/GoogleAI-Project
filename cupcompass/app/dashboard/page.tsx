export default function Dashboard() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Itinerary</h2>
        <ul className="mt-2">
          <li>Philadelphia - June 18</li>
          <li>Toronto - June 24</li>
          <li>Dallas - June 30</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Agent Activity Log</h2>
        <ul className="mt-2">
          <li>✓ Trip created</li>
          <li>✓ Itinerary generated</li>
          <li>✓ Budget calculated</li>
        </ul>
      </section>
    </main>
  );
}