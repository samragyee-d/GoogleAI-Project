import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { decideAgentActions } from "@/lib/agent";

export async function POST(req: Request) {
  try {
    const { tripId, eventType } = await req.json();

    const db = await getDb();

    await db.collection("events").insertOne({
      tripId,
      eventType,
      createdAt: new Date(),
    });

    await db.collection("agent_logs").insertOne({
      tripId,
      message: `Event detected: ${eventType}`,
      createdAt: new Date(),
    });

    const trip = await db.collection("trips").findOne({
      _id: new (await import("mongodb")).ObjectId(tripId),
    });

    const itinerary = await db
      .collection("itineraries")
      .find({ tripId })
      .toArray();

    const decision = await decideAgentActions({
      trip,
      itinerary,
      eventType,
    });

    for (const action of decision.actions || []) {
      if (action.type === "replace_hotel") {
        await db.collection("itineraries").updateOne(
          {
            tripId,
            city: action.city,
          },
          {
            $set: {
              hotel: action.newHotel,
              cost: action.newCost,
              status: "Updated",
              agentNote: action.agentNote,
            },
          }
        );

        await db.collection("agent_logs").insertOne({
          tripId,
          message: `Gemini replaced hotel in ${action.city} with ${action.newHotel}.`,
          createdAt: new Date(),
        });
      }

      if (action.type === "add_itinerary_stop") {
        await db.collection("itineraries").insertOne({
          tripId,
          city: action.city,
          date: action.date,
          match: action.match,
          hotel: action.hotel,
          cost: action.cost,
          status: "Added",
          agentNote: action.agentNote,
          createdAt: new Date(),
        });

        await db.collection("agent_logs").insertOne({
          tripId,
          message: `Gemini added ${action.city} to the itinerary.`,
          createdAt: new Date(),
        });
      }

      if (action.type === "update_cost") {
        await db.collection("itineraries").updateOne(
          {
            tripId,
            city: action.city,
          },
          {
            $set: {
              cost: action.newCost,
              status: "Updated",
              agentNote: action.agentNote,
            },
          }
        );

        await db.collection("agent_logs").insertOne({
          tripId,
          message: `Gemini updated the cost for ${action.city}.`,
          createdAt: new Date(),
        });
      }

      if (action.type === "create_log") {
        await db.collection("agent_logs").insertOne({
          tripId,
          message: action.message,
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to run simulation event",
      },
      { status: 500 }
    );
  }
}