"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import type { Profile } from "../types/database.types"

export const useProfile = () => {
  const { user, profile: authProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      setError("No user logged in")
      return { success: false, error: "No user logged in" }
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, profile: data[0] }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile: authProfile,
    loading,
    error,
    updateProfile,
  }
}

