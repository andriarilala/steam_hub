"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) {
      setError(t("auth.errorRequired"))
      return
    }
    setIsSending(true)
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    setIsSending(false)
    if (res.ok) {
      setSuccess(true)
    } else {
      setError(t("auth.errorSignIn"))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("auth.forgotPassword")}
            </h1>
            <p className="text-foreground/70">
              {t("auth.forgotPasswordDesc")}
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-700 px-4 py-3 rounded-lg text-sm">
              {t("auth.resetEmailSent")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSending ? <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : t("auth.sendResetEmail")}
              </button>
            </form>
          )}

          <p className="text-center mt-8 text-foreground/70">
            <Link href="/signin" className="text-primary font-medium hover:underline">
              {t("auth.backToSignIn")}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
