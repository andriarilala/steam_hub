import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin(req: NextRequest) {
    try {
        const session = (await getServerSession(authOptions as any)) as any;
        if (!session?.user?.email) return null;
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        if (!user || user.role !== "admin") return null;
        return user;
    } catch (e) {
        return null;
    }
}

const BatchSchema = z.object({
    eventId: z.string().optional(),
    ticketType: z.string().default("standard"),
    quantity: z.number().int().min(1).max(500),
    batchId: z.string().min(1),
});

// POST /api/admin/tickets/physical — generate a batch of physical tickets
export async function POST(req: NextRequest) {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();
        const data = BatchSchema.parse(body);

        // Get the current count of physical tickets to generate sequential numbers
        // @ts-ignore
        const count = await prisma.physicalTicket.count();

        const tickets = [];
        for (let i = 0; i < data.quantity; i++) {
            const ticketNumber = `PA-P-${String(count + i + 1).padStart(5, "0")}`;
            tickets.push({
                ticketNumber,
                eventId: data.eventId || null,
                ticketType: data.ticketType,
                batchId: data.batchId,
                status: "active",
            });
        }

        // @ts-ignore
        await prisma.physicalTicket.createMany({
            data: tickets,
        });

        return NextResponse.json({
            success: true,
            message: `${data.quantity} billets physiques générés avec succès.`,
            batchId: data.batchId
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
    }
}

// GET /api/admin/tickets/physical?batchId= — list tickets in a batch
export async function GET(req: NextRequest) {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (search) {
        where.OR = [
            { ticketNumber: { contains: search, mode: "insensitive" } },
            { batchId: { contains: search, mode: "insensitive" } },
            { event: { title: { contains: search, mode: "insensitive" } } }
        ];
    }

    // Build prisma orderBy
    let orderBy: any = {};
    if (sortField === "event") {
        orderBy = { event: { title: sortOrder } };
    } else {
        orderBy = { [sortField]: sortOrder };
    }

    // @ts-ignore
    const tickets = await prisma.physicalTicket.findMany({
        where,
        orderBy,
        include: { event: { select: { title: true } } }
    });

    return NextResponse.json({ tickets });
}

// DELETE /api/admin/tickets/physical?id= — delete a physical ticket
export async function DELETE(req: NextRequest) {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const batchId = searchParams.get("batchId");

    if (!id && !batchId) return NextResponse.json({ error: "id or batchId required" }, { status: 400 });

    try {
        if (id) {
            // @ts-ignore
            await prisma.physicalTicket.delete({ where: { id } });
        } else if (batchId) {
            // @ts-ignore
            await prisma.physicalTicket.deleteMany({ where: { batchId } });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}
