import { NextResponse } from "next/server";
import { seedAll } from "@/lib/seedData";

export async function POST() {
  try {
    const res = await seedAll();

    return NextResponse.json({ success: true, ...res });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "POST to this endpoint to seed hotels and sample trip." });
}
