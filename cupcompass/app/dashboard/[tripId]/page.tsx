
import SimulationButtons from "@/components/SimulationButtons";
async function getTrip(tripId: string) {
  const res = await fetch(`http://localhost:3000/api/trips/${tripId}`, {
    cache: "no-store",
  });

  return res.json();
}

export default async function Dashboard({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const data = await getTrip(tripId);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Trip Info</h2>
        <p>Trip ID: {tripId}</p>
        <p>Fan Type: {data.trip?.fanType}</p>
        <p>Team: {data.trip?.preferredTeam}</p>
        <p>Budget: ${data.trip?.budget}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Itinerary</h2>

        <ul className="mt-2 space-y-3">
          {data.itinerary?.map((item: any) => (
            <li key={item._id} className="border p-4">
              <p className="font-bold">{item.city}</p>
              <p>{item.date}</p>
              <p>{item.match}</p>
              <p>Hotel: {item.hotel}</p>
              <p>Cost: ${item.cost}</p>
              <p>Status: {item.status}</p>
                {item.agentNote ? <p className="italic">Agent note: {item.agentNote}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Agent Activity Log</h2>

        <ul className="mt-2">
          {data.logs?.map((log: any) => (
            <li key={log._id}>
              <span className="font-semibold">{log.message}</span>
              {log.decisionSource ? <span className="ml-2 text-sm text-gray-500">({log.decisionSource})</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <SimulationButtons tripId={tripId} />
    </main>
  );
}