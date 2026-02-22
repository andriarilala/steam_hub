import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

const Schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const { email } = Schema.parse(await req.json())
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // don't reveal whether the email exists
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1h

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires },
    })

    // TODO: send email with link `/reset-password?token=${token}`
    console.log("password reset token for", email, token)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
