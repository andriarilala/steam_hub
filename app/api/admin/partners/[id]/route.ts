import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
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

// GET /api/admin/partners/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      opportunities: true,
      testimonials: true,
      sponsorPackage: {
        include: { analytics: { include: { sponsorLeads: true } } },
      },
      applications: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!partner)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(partner);
}

// PATCH /api/admin/partners/[id] — update partner
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    name,
    slug,
    category,
    type,
    status,
    logo,
    website,
    email,
    phone,
    tagline,
    description,
    vision,
    impact,
    locations,
    userId,
    opportunities,
    testimonials,
    sponsorPackage,
  } = body;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (category !== undefined) data.category = category;
  if (type !== undefined) data.type = type;
  if (status !== undefined) data.status = status;
  if (logo !== undefined) data.logo = logo;
  if (website !== undefined) data.website = website;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (tagline !== undefined) data.tagline = tagline;
  if (description !== undefined) data.description = description;
  if (vision !== undefined) data.vision = vision;
  if (impact !== undefined) data.impact = impact;
  if (locations !== undefined) data.locations = locations;
  if (userId !== undefined) data.userId = userId || null;

  const partner = await prisma.partner.update({
    where: { id },
    data,
  });

  // Handle nested opportunities replace
  if (Array.isArray(opportunities)) {
    await prisma.partnerOpportunity.deleteMany({
      where: { partnerId: id },
    });
    if (opportunities.length > 0) {
      await prisma.partnerOpportunity.createMany({
        data: opportunities.map((o: any) => ({
          partnerId: id,
          title: o.title,
          description: o.description || null,
          level: o.level || null,
          type: o.type || null,
        })),
      });
    }
  }

  // Handle nested testimonials replace
  if (Array.isArray(testimonials)) {
    await prisma.partnerTestimonial.deleteMany({
      where: { partnerId: id },
    });
    if (testimonials.length > 0) {
      await prisma.partnerTestimonial.createMany({
        data: testimonials.map((t: any) => ({
          partnerId: id,
          quote: t.quote,
          author: t.author,
          role: t.role || null,
        })),
      });
    }
  }

  // Handle sponsor package upsert
  if (sponsorPackage) {
    await prisma.sponsorPackage.upsert({
      where: { partnerId: id },
      create: {
        partnerId: id,
        packageType: sponsorPackage.packageType || "PREMIUM",
        budget: sponsorPackage.budget || null,
        startDate: sponsorPackage.startDate
          ? new Date(sponsorPackage.startDate)
          : null,
        endDate: sponsorPackage.endDate
          ? new Date(sponsorPackage.endDate)
          : null,
        benefits: sponsorPackage.benefits || [],
        notes: sponsorPackage.notes || null,
      },
      update: {
        packageType: sponsorPackage.packageType,
        budget: sponsorPackage.budget || null,
        startDate: sponsorPackage.startDate
          ? new Date(sponsorPackage.startDate)
          : null,
        endDate: sponsorPackage.endDate
          ? new Date(sponsorPackage.endDate)
          : null,
        benefits: sponsorPackage.benefits || [],
        notes: sponsorPackage.notes || null,
      },
    });
  }

  return NextResponse.json(partner);
}

// DELETE /api/admin/partners/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.partner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
