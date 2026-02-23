import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Try to find the next upcoming event
    let event = await prisma.event.findFirst({
      where: {
        date: { gte: new Date() }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 2. If no upcoming, find the most recent past event
    if (!event) {
      event = await prisma.event.findFirst({
        orderBy: {
          date: 'desc'
        }
      });
    }

    return NextResponse.json(event ? [event] : []);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
