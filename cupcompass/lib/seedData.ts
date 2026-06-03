import { getDb } from "./mongodb";
import { ObjectId } from "mongodb";

export const hotelsSeed = [
  { city: "Toronto", name: "Toronto Match Hotel", price: 510, available: false, rating: 4.2 },
  { city: "Toronto", name: "Budget Stay Toronto", price: 480, available: true, rating: 3.8 },
  { city: "Toronto", name: "Downtown Toronto Inn", price: 620, available: true, rating: 4.5 },
  { city: "Philadelphia", name: "Center City Inn", price: 420, available: true, rating: 4.0 },
  { city: "Dallas", name: "Dallas Fan Lodge", price: 600, available: true, rating: 4.1 },
  { city: "Dallas", name: "Dallas Budget Lodge", price: 450, available: true, rating: 3.9 },
];

export async function seedHotels() {
  const db = await getDb();

  const ops = hotelsSeed.map((h) => ({
    updateOne: {
      filter: { city: h.city, name: h.name },
      update: { $set: { ...h, createdAt: new Date() } },
      upsert: true,
    },
  }));

  const res = await db.collection("hotels").bulkWrite(ops);

  return res;
}

export async function seedSampleTrip() {
  const db = await getDb();

  const trip = {
    fanType: "traveler",
    budget: 2000,
    preferredTeam: "Canada",
    createdAt: new Date(),
  } as any;

  const tripRes = await db.collection("trips").insertOne(trip);
  const tripId = tripRes.insertedId.toString();

  const itineraries = [
    {
      tripId,
      city: "Toronto",
      date: "2026-06-15",
      match: "Canada vs Brazil",
      hotel: "Toronto Match Hotel",
      cost: 510,
      status: "Planned",
      agentNote: "",
      createdAt: new Date(),
    },
    {
      tripId,
      city: "Dallas",
      date: "2026-06-20",
      match: "USA vs Mexico",
      hotel: "Dallas Fan Lodge",
      cost: 600,
      status: "Planned",
      agentNote: "",
      createdAt: new Date(),
    },
  ];

  await db.collection("itineraries").insertMany(itineraries);

  return { tripId };
}

export async function seedAll() {
  await seedHotels();
  return seedSampleTrip();
}
