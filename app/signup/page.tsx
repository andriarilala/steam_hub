"use client"

import React from "react"

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
  const { signUp, isLoading } = useAuth()
  const { t } = useLanguage()
  
  const [step, setStep] = useState(1)
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
    
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.errorPasswordMatch"))
      return
    }
    
    if (formData.password.length < 8) {
      setError(t("auth.errorPasswordLength"))
      return
    }
    
    if (!formData.agreeTerms) {
      setError(t("auth.errorTerms"))
      return
    }
    
    const success = await signUp({
      email: formData.email,
      password: formData.password,
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
              <span className="text-primary-foreground font-bold text-2xl">PA</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.signUpTitle")}</h1>
            <p className="text-foreground/70">{t("auth.signUpSubtitle")}</p>
          </div>

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
