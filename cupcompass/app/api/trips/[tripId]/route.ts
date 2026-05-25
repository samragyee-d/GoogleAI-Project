import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const db = await getDb();

  const trip = await db.collection("trips").findOne({
    _id: new ObjectId(tripId),
  });

  const itinerary = await db
    .collection("itineraries")
    .find({ tripId })
    .toArray();

  const logs = await db
    .collection("agent_logs")
    .find({ tripId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    trip,
    itinerary,
    logs,
  });
}