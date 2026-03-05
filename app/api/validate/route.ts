import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
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

// GET /api/validate?t={qrCode} — check ticket status before scanning
export async function GET(req: NextRequest) {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const qrCode = searchParams.get("t");

    if (!qrCode) {
        return NextResponse.json({ error: "QR Code is required" }, { status: 400 });
    }

    try {
        // Check digital tickets
        const ticket = await prisma.ticketOrder.findUnique({
            where: { qrCode },
            include: {
                user: { select: { name: true, email: true } },
                event: { select: { title: true, date: true, location: true } },
            },
        });

        if (ticket) {
            return NextResponse.json({
                type: "digital",
                // @ts-ignore
                ticketNumber: ticket.ticketNumber,
                holder: ticket.user.name || ticket.user.email,
                event: ticket.event?.title,
                status: ticket.status,
                // @ts-ignore
                usedAt: ticket.usedAt,
                isWaitlisted: ticket.status !== "completed",
            });
        }

        // Check physical tickets
        // @ts-ignore
        const physical = await prisma.physicalTicket.findUnique({
            where: { ticketNumber: qrCode },
            include: { event: { select: { title: true } } },
        });

        if (physical) {
            return NextResponse.json({
                type: "physical",
                // @ts-ignore
                ticketNumber: physical.ticketNumber,
                // @ts-ignore
                status: physical.status,
                // @ts-ignore
                usedAt: physical.usedAt,
            });
        }

        return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
    } catch (error: any) {
        console.error("[VALIDATE_GET]", error);
        return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
    }
}

// POST /api/validate — actually mark the ticket as used (burn it)
export async function POST(req: NextRequest) {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { qrCode } = body;

    if (!qrCode) {
        return NextResponse.json({ error: "QR Code is required" }, { status: 400 });
    }

    try {
        // 1. Try digital ticket
        const ticket = await prisma.ticketOrder.findUnique({
            where: { qrCode },
        });

        if (ticket) {
            if (ticket.status !== "completed") {
                return NextResponse.json({ error: "Ce billet n'est pas encore validé par l'administration" }, { status: 400 });
            }
            // @ts-ignore
            if (ticket.usedAt) {
                return NextResponse.json({
                    error: "Billet déjà utilisé",
                    // @ts-ignore
                    usedAt: ticket.usedAt
                }, { status: 400 });
            }

            const updated = await prisma.ticketOrder.update({
                where: { qrCode },
                data: {
                    // @ts-ignore
                    usedAt: new Date(),
                    // @ts-ignore
                    usedBy: admin.email,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Billet validé avec succès !",
                // @ts-ignore
                ticketNumber: updated.ticketNumber
            });
        }

        // 2. Try physical ticket
        // @ts-ignore
        const physical = await prisma.physicalTicket.findUnique({
            where: { ticketNumber: qrCode },
        });

        if (physical) {
            // @ts-ignore
            if (physical.status === "used" || physical.usedAt) {
                return NextResponse.json({
                    error: "Billet physique déjà utilisé",
                    // @ts-ignore
                    usedAt: physical.usedAt
                }, { status: 400 });
            }

            // @ts-ignore
            const updated = await prisma.physicalTicket.update({
                where: { ticketNumber: qrCode },
                data: {
                    // @ts-ignore
                    status: "used",
                    // @ts-ignore
                    usedAt: new Date(),
                    // @ts-ignore
                    usedBy: admin.email,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Billet physique validé !",
                // @ts-ignore
                ticketNumber: updated.ticketNumber
            });
        }

        return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
    } catch (error: any) {
        console.error("[VALIDATE_POST]", error);
        return NextResponse.json({ error: "Erreur lors de la validation" }, { status: 500 });
    }
}
