import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// return list of suggested connections (same logic as dashboard)
export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const connected = await prisma.userConnection.findMany({
    where: { userId: user.id },
    select: { targetId: true },
  });
  const connectedIds = connected.map((c: { targetId: string }) => c.targetId);

  const recs = await prisma.user.findMany({
    where: { id: { notIn: [...connectedIds, user.id] } },
    take: 10,
  });
  const recommendedConnections = recs.map((r: any) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    image: r.image || "/placeholder.svg",
  }));

  return NextResponse.json({ recommendedConnections });
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { targetId } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });

  await prisma.userConnection.upsert({
    where: { userId_targetId: { userId: user.id, targetId } },
    update: {},
    create: { userId: user.id, targetId, status: "connected" },
  });

  return NextResponse.json({ success: true });
}
