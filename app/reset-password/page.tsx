"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { Lock, Eye, EyeOff } from "lucide-react"

function ResetPasswordContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useSearchParams()
  const token = params?.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError(t("auth.invalidToken"))
    }
  }, [token, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || !confirm) {
      setError(t("auth.errorRequired"))
      return
    }

    if (password !== confirm) {
      setError(t("auth.errorPasswordMatch"))
      return
    }

    if (password.length < 8) {
      setError(t("auth.errorPasswordLength"))
      return
    }

    if (!token) return

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (res.ok) {
        setSuccess(true)

        // Optionnel : redirection après succès
        setTimeout(() => {
          router.push("/signin")
        }, 2000)
      } else {
        setError(t("auth.invalidToken"))
      }
    } catch (err) {
      setError("Server error")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("auth.resetPasswordTitle")}
            </h1>
            <p className="text-foreground/70">
              {t("auth.resetPasswordSubtitle")}
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-700 px-4 py-3 rounded-lg text-sm">
              {t("auth.resetSuccess")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.newPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type={show ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                  >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.confirmPassword")}
                </label>
                <input
                  type={show ? "text" : "password"}
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  placeholder="********"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  t("auth.resetPassword")
                )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}