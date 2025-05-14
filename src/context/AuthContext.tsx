"use client"

import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import { useAuth as useAuthImplementation } from "../hooks/useAuth"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "../types/database.types"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthImplementation()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

// Keep the useAuth export as well
export const useAuth = useAuthContext

