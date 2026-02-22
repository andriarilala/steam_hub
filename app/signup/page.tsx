"use client"

import React, { useEffect } from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, Check } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

const roles: { value: UserRole; labelKey: string; descKey: string }[] = [
  { value: "youth", labelKey: "auth.roleYouth", descKey: "auth.roleYouthDesc" },
  { value: "company", labelKey: "auth.roleCompany", descKey: "auth.roleCompanyDesc" },
  { value: "institution", labelKey: "auth.roleInstitution", descKey: "auth.roleInstitutionDesc" },
  { value: "mentor", labelKey: "auth.roleMentor", descKey: "auth.roleMentorDesc" },
  { value: "sponsor", labelKey: "auth.roleSponsor", descKey: "auth.roleSponsorDesc" },
]

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, signInWithProvider, isLoading, isAuthenticated } = useAuth()
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
  const facebookEnabled = Boolean(process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID)
  const { t } = useLanguage()
  
  const [step, setStep] = useState(1)

  // redirect if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "youth" as UserRole,
    organization: "",
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
  }

  const handleNext = () => {
    setError("")
    if (step === 1 && !formData.role) {
      setError(t("auth.errorSelectRole"))
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name || !formData.email || !formData.password) {
      setError(t("auth.errorRequired"))
      return
    }
    const cleanEmail = formData.email.trim().toLowerCase()
    const cleanPassword = formData.password.trim()
    const cleanConfirm = formData.confirmPassword.trim()
    
    if (cleanPassword !== cleanConfirm) {
      setError(t("auth.errorPasswordMatch"))
      return
    }
    
    if (cleanPassword.length < 8) {
      setError(t("auth.errorPasswordLength"))
      return
    }
    
    if (!formData.agreeTerms) {
      setError(t("auth.errorTerms"))
      return
    }
    
    const success = await signUp({
      email: cleanEmail,
      password: cleanPassword,
      name: formData.name,
      role: formData.role,
      organization: formData.organization,
    })
    
    if (success) {
      router.push("/dashboard")
    } else {
      setError(t("auth.errorSignUp"))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <img
  src="/logo.png"
  alt="Logo"
  className="h-12 w-auto self-center"
/>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.signUpTitle")}</h1>
            <p className="text-foreground/70">{t("auth.signUpSubtitle")}</p>
          </div>
          {/* social signup on first step */}
          {step === 1 && (
            <div className="space-y-3 mb-8">
              <button
                type="button"
                disabled={isLoading || !googleEnabled}
                onClick={() => {
                  signInWithProvider("google").catch(() => {})
                }}
                className="w-full border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {/* google icon copied from sign-in page */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("auth.continueGoogle")}
              </button>
              <button
                type="button"
                disabled={isLoading || !facebookEnabled}
                onClick={() => {
                  signInWithProvider("facebook").catch(() => {})
                }}
                className="w-full border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t("auth.continueFacebook")}
              </button>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step
                      ? "bg-primary text-primary-foreground"
                      : s === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground/50"
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Select Role */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("auth.selectRole")}</h2>
              <div className="grid gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      formData.role === role.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{t(role.labelKey)}</p>
                        <p className="text-sm text-foreground/70">{t(role.descKey)}</p>
                      </div>
                      {formData.role === role.value && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
              >
                {t("auth.continue")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <form className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("auth.basicInfo")}</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.fullName")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {(formData.role === "company" || formData.role === "institution" || formData.role === "sponsor") && (
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
                    {t("auth.organization")}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      placeholder="Your Company/Institution"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  {t("auth.back")}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {t("auth.continue")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Password & Confirm */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("auth.createPassword")}</h2>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-foreground/50 mt-1">{t("auth.passwordHint")}</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="********"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 mt-0.5"
                />
                <span className="text-sm text-foreground/70">
                  {t("auth.agreeTerms")}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("auth.terms")}
                  </Link>{" "}
                  {t("auth.and")}{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    {t("auth.privacy")}
                  </Link>
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  {t("auth.back")}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("auth.createAccount")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <p className="text-center mt-8 text-foreground/70">
            {t("auth.haveAccount")}{" "}
            <Link href="/signin" className="text-primary font-medium hover:underline">
              {t("auth.signInLink")}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
