import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  const { tripId, eventType } = await req.json();
  const db = await getDb();

  await db.collection("events").insertOne({
    tripId,
    eventType,
    status: "new",
    createdAt: new Date(),
  });

  await db.collection("agent_logs").insertOne({
    tripId,
    message: `Event detected: ${eventType}`,
    type: "warning",
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}