import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { processEvent } from "@/lib/agent";

export async function POST(req: Request) {
  try {
    const { tripId, eventType } = await req.json();

    const db = await getDb();

    const evRes = await db.collection("events").insertOne({
      tripId,
      eventType,
      status: "new",
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

    const decision = await processEvent({
      trip,
      itinerary,
      eventType,
      tripId,
    });

    const decisionSource = decision?.decisionSource || (process.env.AGENT_BUILDER_ENDPOINT ? "AgentBuilder" : "LocalGemini");

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
          message: `Agent replaced hotel in ${action.city} with ${action.newHotel}.`,
          decisionSource,
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
          message: `Agent added ${action.city} to the itinerary.`,
          decisionSource,
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
          message: `Agent updated the cost for ${action.city}.`,
          decisionSource,
          createdAt: new Date(),
        });
      }

      if (action.type === "create_log") {
        await db.collection("agent_logs").insertOne({
          tripId,
          message: action.message,
          decisionSource,
          createdAt: new Date(),
        });
      }
    }

    // mark event processed
    try {
      await db.collection("events").updateOne(
        { _id: evRes.insertedId },
        { $set: { status: "processed", processedAt: new Date() } }
      );
    } catch (e) {
      console.error("Failed to mark event processed", e);
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