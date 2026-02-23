import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(5),
});

// Public endpoint — no auth required
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ContactSchema.parse(body);

    const msg = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        subject: data.subject,
        message: data.message,
        status: "unread",
      },
    });

    return NextResponse.json({ success: true, id: msg.id }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
