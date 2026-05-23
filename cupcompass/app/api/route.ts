import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("Created trip:", body);

  return NextResponse.json({
    tripId: "demo-trip-1"
  });
}