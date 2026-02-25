import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events — returns all events ordered by date
export async function GET(req: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
