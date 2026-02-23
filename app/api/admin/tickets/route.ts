import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

async function requireAdmin(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.role !== "admin") return null;
  return user;
}

const TICKET_TYPES = ["standard", "vip", "student", "virtual"] as const;
const TICKET_STATUSES = [
  "pending",
  "completed",
  "failed",
  "cancelled",
] as const;

const TicketSchema = z.object({
  userId: z.string().min(1),
  eventId: z.string().optional(),
  ticketType: z.enum(TICKET_TYPES),
  quantity: z.number().int().min(1).default(1),
  price: z.number().min(0),
  total: z.number().min(0),
  status: z.enum(TICKET_STATUSES).default("pending"),
});

// GET /api/admin/tickets?page=1&status=&eventId=&search=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const statusFilter = searchParams.get("status") || "";
  const eventId = searchParams.get("eventId") || "";
  const search = searchParams.get("search") || "";
  const pageSize = 20;

  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (eventId) where.eventId = eventId;
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticketOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        event: { select: { id: true, title: true, date: true, type: true } },
      },
    }),
    prisma.ticketOrder.count({ where }),
  ]);

  return NextResponse.json({
    tickets,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/admin/tickets — admin creates a ticket for a user
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const data = TicketSchema.parse(body);

  // verify user exists
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // verify event exists if provided
  if (data.eventId) {
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ticket = await prisma.ticketOrder.create({
    data: {
      userId: data.userId,
      eventId: data.eventId || null,
      ticketType: data.ticketType,
      quantity: data.quantity,
      price: data.price,
      total: data.total,
      status: data.status,
      qrCode: randomUUID(), // unique QR token
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true, date: true } },
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}

// PATCH /api/admin/tickets — update ticket fields
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data = TicketSchema.partial().parse(rest);

  const ticket = await prisma.ticketOrder.update({
    where: { id },
    data: {
      ...(data.eventId !== undefined ? { eventId: data.eventId || null } : {}),
      ...(data.ticketType ? { ticketType: data.ticketType } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.total !== undefined ? { total: data.total } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true, date: true } },
    },
  });

  return NextResponse.json(ticket);
}

// DELETE /api/admin/tickets?id=
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.ticketOrder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
