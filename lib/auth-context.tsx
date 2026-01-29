"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (data: SignUpData) => Promise<boolean>
  signOut: () => void
}

export interface SignUpData {
  email: string
  password: string
  name: string
  role: UserRole
  organization?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("pass_avenir_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("pass_avenir_user")
      }
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Demo: Accept any email/password for testing
    const demoUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role: "youth",
      connections: 0,
      createdAt: new Date().toISOString(),
    }
    
    setUser(demoUser)
    localStorage.setItem("pass_avenir_user", JSON.stringify(demoUser))
    setIsLoading(false)
    return true
  }

  const signUp = async (data: SignUpData): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      role: data.role,
      organization: data.organization,
      connections: 0,
      createdAt: new Date().toISOString(),
    }
    
    setUser(newUser)
    localStorage.setItem("pass_avenir_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("pass_avenir_user")
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
