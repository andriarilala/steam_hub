import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: now } },
    orderBy: { date: "asc" },
    take: 3,
  });

  // recommended connections: other users not already connected
  const connected = await prisma.userConnection.findMany({
    where: { userId: user.id },
    select: { targetId: true },
  });
  const connectedIds = connected.map((c: { targetId: string }) => c.targetId);

  const recs = await prisma.user.findMany({
    where: { id: { notIn: [...connectedIds, user.id] } },
    take: 3,
  });
  const recommendedConnections = recs.map((r: any) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    image: r.image || "/placeholder.svg",
  }));

  const connectionsCount = await prisma.userConnection.count({
    where: { userId: user.id },
  });

  const stats = {
    sessionsAttended: 0,
    connectionsCount,
    messagesCount: 0,
    opportunitiesSaved: 0,
  };

  return NextResponse.json({ upcomingEvents, recommendedConnections, stats });
}
