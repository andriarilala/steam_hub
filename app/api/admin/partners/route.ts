import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "admin") return null;
  return user;
}

// GET /api/admin/partners?page=1&search=&type=&status=&category=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const pageSize = 20;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (status) where.status = status;
  if (category) where.category = category;

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        opportunities: { select: { id: true, title: true } },
        sponsorPackage: { select: { id: true, packageType: true, budget: true } },
        applications: { select: { id: true, status: true } },
        _count: { select: { applications: true, opportunities: true, testimonials: true } },
      },
    }),
    prisma.partner.count({ where }),
  ]);

  return NextResponse.json({ partners, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

// POST /api/admin/partners — create a new partner
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, category, type, status, slug, logo, website, email, phone,
    tagline, description, vision, impact, locations, userId } = body;

  if (!name || !category) {
    return NextResponse.json({ error: "name and category are required" }, { status: 400 });
  }

  // auto-generate slug if not provided
  const rawSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Check slug uniqueness
  const existing = await prisma.partner.findUnique({ where: { slug: rawSlug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists. Change the partner name or provide a custom slug." }, { status: 409 });
  }

  const partner = await prisma.partner.create({
    data: {
      name,
      slug: rawSlug,
      category,
      type: type || "PARTNER",
      status: status || "ACTIVE",
      logo: logo || null,
      website: website || null,
      email: email || null,
      phone: phone || null,
      tagline: tagline || null,
      description: description || null,
      vision: vision || null,
      impact: impact || null,
      locations: locations || [],
      userId: userId || null,
    },
  });

  return NextResponse.json(partner, { status: 201 });
}
