import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("Trip created:", body);

  return NextResponse.json({
    success: true,
    tripId: "demo-trip-1",
  });
}