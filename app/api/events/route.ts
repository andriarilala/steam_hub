import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(events);
}
