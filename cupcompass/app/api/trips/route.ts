import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  const body = await req.json();
  const db = await getDb();

  const trip = {
    fanType: body.fanType,
    budget: Number(body.budget),
    preferredTeam: body.preferredTeam,
    createdAt: new Date(),
  };

  const result = await db.collection("trips").insertOne(trip);

  return NextResponse.json({
    success: true,
    tripId: result.insertedId.toString(),
  });
}