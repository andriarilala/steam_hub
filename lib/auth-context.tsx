"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"

export type UserRole = "youth" | "company" | "institution" | "mentor" | "sponsor"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  organization?: string
  bio?: string
  interests?: string[]
  connections?: number
  createdAt: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
  role: UserRole
  organization?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<boolean>
  signInWithProvider: (provider: "google" | "facebook", remember?: boolean) => Promise<boolean>
  signUp: (data: SignUpData) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  // derive user from session
  const user = session?.user ? (session.user as User) : null
  const isAuthenticated = !!user
  const isLoading = loading || status === "loading"

  const signIn = async (email: string, password: string, remember = false): Promise<boolean> => {
    setLoading(true)
    try {
      // normalize input: trim whitespace
      const cleanEmail = email.trim().toLowerCase()
      const cleanPassword = password.trim()
      const res = await nextAuthSignIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password: cleanPassword,
      })
      return res?.ok ?? false
    } catch (err) {
      console.error("signIn error", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: SignUpData): Promise<boolean> => {
    setLoading(true)
    // normalize before sending
    const payload = {
      ...data,
      email: data.email.trim().toLowerCase(),
      password: data.password.trim(),
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      setLoading(false)
      return false
    }
    // automatically sign in after successful registration
    const signed = await signIn(payload.email, payload.password)
    setLoading(false)
    return signed
  }

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: "/" })
  }

  const signInWithProvider = async (provider: "google" | "facebook", remember = false): Promise<boolean> => {
    try {
      console.log(`Initiating ${provider} sign-in...`)
      // nextAuthSignIn will redirect the browser automatically
      const result = await nextAuthSignIn(provider, {
        redirect: true,
        callbackUrl: "/dashboard",
      })
      console.log(`${provider} sign-in result:`, result)
      return true
    } catch (err) {
      console.error(`${provider} sign in error:`, err)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
