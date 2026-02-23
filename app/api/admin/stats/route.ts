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

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [
    totalUsers,
    totalEvents,
    totalConnections,
    totalContacts,
    totalTicketOrders,
    recentUsers,
    roleBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.userConnection.count(),
    prisma.contactMessage.count(),
    prisma.ticketOrder.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ]);

  const unreadContacts = await prisma.contactMessage.count({
    where: { status: "unread" },
  });

  return NextResponse.json({
    totalUsers,
    totalEvents,
    totalConnections,
    totalContacts,
    unreadContacts,
    totalTicketOrders,
    recentUsers,
    roleBreakdown: roleBreakdown.map((r: any) => ({
      role: r.role,
      count: r._count.role,
    })),
  });
}
