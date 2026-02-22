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
  // NOTE: this client‑side provider is only a demo.  It stores user data in
  // localStorage and hashes passwords locally.  For a production application
  // you should perform authentication securely on the server over HTTPS,
  // use OAuth flows for Google/Facebook, issue a JWT or session cookie with
  // the HttpOnly and Secure flags set, and never keep plaintext passwords or
  // tokens in localStorage.
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // next-auth session hook (wrapped in try/catch because sometimes
  // during hydration the SessionProvider context isn't available yet and
  // useSession throws "must be wrapped".)
  let session: any = null
  let status: "loading" | "authenticated" | "unauthenticated" = "loading"
  try {
    const s = useSession()
    session = s.data
    status = s.status
  } catch (err) {
    // ignore; will re-run once provider is ready
  }

  useEffect(() => {
    // If next-auth reports an authenticated session, mirror it in our context.
    if (status === "authenticated" && session?.user) {
      const u: User = {
        id: session.user.email || session.user.name || "",
        email: session.user.email || "",
        name: session.user.name || "",
        role: "youth",
        avatar: session.user.image || undefined,
        connections: 0,
        createdAt: new Date().toISOString(),
      }
      setUser(u)
      // optionally persist
      localStorage.setItem("pass_avenir_user", JSON.stringify(u))
      setIsLoading(false)
      return
    }
    // otherwise fall back to local/session storage as before
    let savedUser = localStorage.getItem("pass_avenir_user")
    if (!savedUser) {
      savedUser = sessionStorage.getItem("pass_avenir_user")
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("pass_avenir_user")
        sessionStorage.removeItem("pass_avenir_user")
      }
    }
    // if session status is loading, wait until second effect triggers
    if (status !== "loading") {
      setIsLoading(false)
    }
  }, [session, status])

  // helper to hash a password using SHA-256
  async function hashPassword(password: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  const signIn = async (email: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true)
    
    // in a real app this would hit your backend over HTTPS and verify credentials
    await new Promise((resolve) => setTimeout(resolve, 500))

    const stored = localStorage.getItem(`pass_user_${email}`)
    if (stored) {
      try {
        const { user: savedUser, hashedPassword } = JSON.parse(stored) as {
          user: User
          hashedPassword: string
        }
        const attempted = await hashPassword(password)
        if (attempted === hashedPassword) {
          setUser(savedUser)
          const storage = remember ? localStorage : sessionStorage
          storage.setItem("pass_avenir_user", JSON.stringify(savedUser))
          setIsLoading(false)
          return true
        }
      } catch {}
    }

    setIsLoading(false)
    return false
  }

  const signUp = async (data: SignUpData): Promise<boolean> => {
    setIsLoading(true)
    
    // simulate backend validation and storage
    await new Promise((resolve) => setTimeout(resolve, 500))
    const hashed = await hashPassword(data.password)

    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      role: data.role,
      organization: data.organization,
      connections: 0,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`pass_user_${data.email}`, JSON.stringify({ user: newUser, hashedPassword: hashed }))
    setUser(newUser)
    localStorage.setItem("pass_avenir_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const signOut = () => {
    // clear both our local state and next-auth session
    nextAuthSignOut({ callbackUrl: "/" })
    setUser(null)
    localStorage.removeItem("pass_avenir_user")
    sessionStorage.removeItem("pass_avenir_user")
  }

  // provider sign‑in simply generates a demo user (in a real project you
  // would redirect to the OAuth flow and handle the callback on the server)
  const signInWithProvider = async (provider: "google" | "facebook", remember = false): Promise<boolean> => {
    // delegate to next-auth which will redirect to provider
    setIsLoading(true)
    await nextAuthSignIn(provider, { callbackUrl: "/dashboard" })
    // actual success is handled by next-auth redirect; mark loading false
    setIsLoading(false)
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
