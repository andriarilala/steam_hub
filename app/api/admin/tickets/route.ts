import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";
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
  reference: z.string().optional(),
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
  const sortField = searchParams.get("sortField") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const pageSize = 20;

  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (eventId) where.eventId = eventId;
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { ticketNumber: { contains: search, mode: "insensitive" } },
      { event: { title: { contains: search, mode: "insensitive" } } }
    ];
  }

  // Build prisma orderBy
  let orderBy: any = {};
  if (sortField === "event") {
    orderBy = { event: { title: sortOrder } };
  } else if (sortField === "user") {
    orderBy = { user: { name: sortOrder } };
  } else {
    orderBy = { [sortField]: sortOrder };
  }

  const [tickets, total] = await Promise.all([
    prisma.ticketOrder.findMany({
      where,
      orderBy,
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

  try {
    const existingTickets = await prisma.ticketOrder.findMany({
      where: { ticketNumber: { startsWith: "PA " } },
      select: { ticketNumber: true },
    });

    const usedNumbers = new Set<number>();
    for (const t of existingTickets) {
      if (!t.ticketNumber) continue;
      const n = parseInt(t.ticketNumber.replace(/[^0-9]/g, ""), 10);
      if (!Number.isNaN(n)) usedNumbers.add(n);
    }

    let next = 1;
    while (usedNumbers.has(next)) next++;
    const ticketNumber = `PA ${String(next).padStart(5, "0")}`;

    const ticket = await prisma.ticketOrder.create({
      data: {
        userId: data.userId,
        eventId: data.eventId || null,
        // @ts-ignore
        ticketNumber,
        ticketType: data.ticketType,
        quantity: data.quantity,
        price: data.price,
        total: data.total,
        status: data.status,
        reference: data.reference ?? null,
        qrCode: randomUUID(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, date: true } },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error("[ADMIN_TICKET_POST]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

// PATCH /api/admin/tickets — update ticket fields
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    // Charger le ticket actuel pour détecter un changement de statut
    const existing = await prisma.ticketOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, date: true, location: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const data = TicketSchema.partial().parse(rest);

    // If a new userId is provided, verify the user exists
    if (data.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true },
      });
      if (!userExists)
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ticket = await prisma.ticketOrder.update({
      where: { id },
      data: {
        ...(data.userId ? { userId: data.userId } : {}),
        ...(data.eventId !== undefined ? { eventId: data.eventId || null } : {}),
        ...(data.ticketType ? { ticketType: data.ticketType } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.total !== undefined ? { total: data.total } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.reference !== undefined
          ? { reference: data.reference || null }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, date: true, location: true } },
      },
    });

    // Si le statut vient de passer à "completed", déclencher l'envoi de billet par email
    if (existing.status !== "completed" && ticket.status === "completed") {
      try {
        await sendTicketEmail({
          to: ticket.user.email,
          name: ticket.user.name,
          ticket: {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            qrCode: ticket.qrCode,
            quantity: ticket.quantity,
            ticketType: ticket.ticketType,
            reference: ticket.reference,
            event: ticket.event
              ? {
                  title: ticket.event.title,
                  date: ticket.event.date,
                  location: ticket.event.location ?? null,
                }
              : null,
          },
        });
      } catch (e) {
        console.error("[TICKET_EMAIL_FAILED]", e);
      }
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("[ADMIN_TICKET_PATCH]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
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
