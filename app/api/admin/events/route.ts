import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.role !== "admin") return null;
  return user;
}

const EventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(), // ISO string
  time: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  price: z.number().min(0).optional(),
  phone_number: z.string().optional(),
});

// GET /api/admin/events
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(events);
}

// POST /api/admin/events — create event
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const result = EventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 },
      );
    }
    const data = result.data;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
        type: data.type,
        price: data.price,
        phone_number: data.phone_number,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/events error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/events — update event
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = EventSchema.partial().safeParse(rest);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 },
      );
    }
    const data = result.data;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error("PATCH /api/admin/events error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/events?id=
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/events error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
