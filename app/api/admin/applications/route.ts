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

// GET /api/admin/applications?page=1&search=&status=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const pageSize = 20;

  const where: any = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.sponsorApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { partner: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.sponsorApplication.count({ where }),
  ]);

  return NextResponse.json({
    applications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// PATCH /api/admin/applications — update application status
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, partnerId } = await req.json();
  if (!id || !status)
    return NextResponse.json(
      { error: "id and status required" },
      { status: 400 },
    );

  const updated = await prisma.sponsorApplication.update({
    where: { id },
    data: { status, partnerId: partnerId || undefined },
  });
  return NextResponse.json(updated);
}

// DELETE /api/admin/applications — delete an application
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.sponsorApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
