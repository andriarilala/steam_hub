import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

const PurchaseSchema = z.object({
  fullName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  transactionRef: z.string().min(1, "Référence requise"),
  quantity: z.number().int().min(1).max(10).default(1),
});

// POST /api/tickets/purchase
// Achats de billets via formulaire public (sans création de compte côté UX)
export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = PurchaseSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Données invalides";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  const { fullName, email, transactionRef, quantity } = parsed.data;

  try {
    // Trouver ou créer un utilisateur technique associé à cet email
    // (pas de mot de passe, pas de login nécessaire, juste pour rattacher les billets)
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: fullName },
      create: {
        email,
        name: fullName,
        role: "youth", // rôle par défaut pour les participants
      },
    });

    // Récupérer un événement principal (le prochain PASS AVENIR s'il existe)
    const event = await prisma.event.findFirst({
      orderBy: { date: "asc" },
    });

    const unitPrice = 3000;

    const existingTickets = await prisma.ticketOrder.findMany({
      where: { ticketNumber: { startsWith: "PA " } },
      select: { ticketNumber: true },
    });

    const usedNumbers = new Set<number>();
    for (const t of existingTickets) {
      if (!t.ticketNumber) continue;
      const n = parseInt(t.ticketNumber.replace(/[^0-9]/g, ""), 10);
      if (!Number.isNaN(n)) usedNumbers.add(n);
    }

    const tickets = [] as { id: string; status: string }[];

    const getNextNumber = () => {
      let n = 1;
      while (usedNumbers.has(n)) n++;
      usedNumbers.add(n);
      return n;
    };

    for (let i = 0; i < quantity; i++) {
      const numberIndex = getNextNumber();
      const ticketNumber = `PA ${String(numberIndex).padStart(5, "0")}`;

      const ticket = await prisma.ticketOrder.create({
        data: {
          userId: user.id,
          eventId: event?.id ?? null,
          // @ts-ignore
          ticketNumber,
          ticketType: "standard",
          quantity: 1,
          price: unitPrice,
          total: unitPrice,
          reference: transactionRef,
          status: "pending", // en attente de validation manuelle par l'admin
          qrCode: randomUUID(),
        },
        include: {
          event: {
            select: { id: true, title: true, date: true, location: true, price: true },
          },
        },
      });

      tickets.push({ id: ticket.id, status: ticket.status });
    }

    return NextResponse.json({ tickets }, { status: 201 });
  } catch (error) {
    console.error("[PUBLIC_TICKET_PURCHASE]", error);
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}
