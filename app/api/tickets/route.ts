import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

async function requireUser(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user ?? null;
}

const PurchaseSchema = z.object({
  eventId: z.string().min(1),
  ticketType: z.enum(["standard", "vip", "student", "virtual"]),
  quantity: z.number().int().min(1).default(1),
  reference: z.string().optional(), // optional payment reference
});

// GET /api/tickets — returns the current authenticated user's ticket orders
export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = await prisma.ticketOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          type: true,
          price: true,
        },
      },
    },
  });

  return NextResponse.json(tickets);
}

// POST /api/tickets — youth user purchases a ticket
// Price is computed automatically from event.price × quantity
export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "youth" && user.role !== "admin") {
    return NextResponse.json(
      { error: "Only youth accounts can purchase tickets" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Verify the event exists
  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Compute price from event.price * quantity (fallback to 0 if event has no price)
  const unitPrice = event.price ?? 0;
  const total = unitPrice * data.quantity;

  // Generate sequential ticket number: PA 00001, etc.
  const count = await prisma.ticketOrder.count();
  const ticketNumber = `PA ${String(count + 1).padStart(5, "0")}`;

  const ticket = await prisma.ticketOrder.create({
    data: {
      userId: user.id,
      eventId: event.id,
      // @ts-ignore
      ticketNumber,
      ticketType: data.ticketType,
      quantity: data.quantity,
      price: total, // total cost stored as price
      total: total,
      reference: data.reference ?? null,
      status: "pending", // awaiting admin validation
      qrCode: randomUUID(),
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          price: true,
        },
      },
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
