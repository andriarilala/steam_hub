import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.role !== "admin") return null;
  return user;
}

// GET /api/admin/contacts?page=1&status=unread
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const status = searchParams.get("status") || "";
  const pageSize = 20;

  const where: any = {};
  if (status) where.status = status;

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return NextResponse.json({
    messages,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// PATCH /api/admin/contacts — mark as read / replied
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  if (!id || !status)
    return NextResponse.json(
      { error: "id and status required" },
      { status: 400 },
    );

  const validStatuses = ["unread", "read", "replied"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const msg = await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(msg);
}

// DELETE /api/admin/contacts?id=
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
