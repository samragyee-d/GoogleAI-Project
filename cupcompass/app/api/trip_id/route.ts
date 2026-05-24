import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();

    // Create trip
    const trip = {
      fanType: body.fanType,
      budget: Number(body.budget),
      preferredTeam: body.preferredTeam,
      createdAt: new Date(),
    };

    const tripResult = await db.collection("trips").insertOne(trip);

    const tripId = tripResult.insertedId.toString();

    // Create fake itinerary
    const itinerary = [
      {
        tripId,
        city: "Philadelphia",
        date: "June 18, 2026",
        match: `${body.preferredTeam} vs Japan`,
        hotel: "Center City Inn",
        cost: 420,
        status: "Planned",
      },
      {
        tripId,
        city: "Toronto",
        date: "June 24, 2026",
        match: `${body.preferredTeam} Round of 16`,
        hotel: "Toronto Match Hotel",
        cost: 510,
        status: "Planned",
      },
      {
        tripId,
        city: "Dallas",
        date: "June 30, 2026",
        match: `${body.preferredTeam} Quarterfinal`,
        hotel: "Dallas Fan Lodge",
        cost: 600,
        status: "Planned",
      },
    ];

    await db.collection("itineraries").insertMany(itinerary);

    // Create first agent log
    await db.collection("agent_logs").insertOne({
      tripId,
      message: "Trip created and itinerary generated.",
      type: "success",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      tripId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create trip",
      },
      {
        status: 500,
      }
    );
  }
}