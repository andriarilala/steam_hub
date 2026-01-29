"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            {!submitted ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Reset Your Password</h1>
                <p className="text-foreground/70 text-center mb-8">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <Link href="/signin" className="flex items-center justify-center gap-2 mt-6 text-primary hover:underline font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </>
            ) : (
              <>
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-foreground mb-2">Check Your Email</h1>
                  <p className="text-foreground/70 mb-6">
                    We've sent a password reset link to <span className="font-semibold">{email}</span>
                  </p>
                  <p className="text-sm text-foreground/60 mb-8">
                    Click the link in your email to reset your password. The link expires in 24 hours.
                  </p>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8 text-sm text-foreground/70">
                    <p className="mb-3">Didn't receive the email?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email</li>
                      <li>Wait a few minutes and try again</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setEmail("")
                    }}
                    className="text-primary hover:underline font-medium mb-4"
                  >
                    Try Another Email
                  </button>

                  <Link href="/" className="block text-primary hover:underline font-medium">
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center text-sm text-foreground/60">
            <p>Need help? Contact our support team at support@passavenir.com</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
