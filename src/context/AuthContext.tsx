"use client"

import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import { useAuthImplementation } from "../hooks/useAuth"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "../types/database.types"

// The return type of the hook is inferred, so we don't need to define the interface manually.
type AuthContextType = ReturnType<typeof useAuthImplementation>

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthImplementation()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Keep the useAuth export as well
export const useAuthContext = useAuth

