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

// GET /api/admin/users?page=1&search=&role=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const pageSize = 20;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        image: true,
        createdAt: true,
        emailVerified: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// PATCH /api/admin/users — update role or name
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, role, name } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const validRoles = [
    "youth",
    "company",
    "institution",
    "mentor",
    "sponsor",
    "admin",
  ];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const data: any = {};
  if (role) data.role = role;
  if (name) data.name = name;

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({
    success: true,
    user: { id: updated.id, role: updated.role, name: updated.name },
  });
}

// DELETE /api/admin/users?id=
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (id === admin.id)
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 },
    );

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
