import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  return NextResponse.json({
    trip: {
      fanType: "Groundhopper",
      preferredTeam: "Argentina",
      budget: 5000,
    },
    itinerary: [
      {
        _id: "1",
        city: "Philadelphia",
        date: "June 18, 2026",
        match: "Argentina vs Japan",
        hotel: "Center City Inn",
        cost: 420,
        status: "Planned",
      },
      {
        _id: "2",
        city: "Toronto",
        date: "June 24, 2026",
        match: "Argentina Round of 16",
        hotel: "Toronto Match Hotel",
        cost: 510,
        status: "Planned",
      },
    ],
    logs: [
      {
        _id: "1",
        message: `Trip ${tripId} created.`,
      },
      {
        _id: "2",
        message: "Itinerary generated.",
      },
    ],
  });
}