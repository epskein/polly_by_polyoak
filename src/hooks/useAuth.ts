"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "../types/database.types"

export function useAuthImplementation() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfile = useCallback(async (userToFetch: User | null) => {
    if (!userToFetch) {
      setProfile(null)
      return
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userToFetch.id)
        .single()
      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error("Failed to fetch profile", err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    // Check initial session. With persistSession: false, this will be null
    // on page load, but it's good practice to have it.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        const newUser = newSession?.user ?? null
        setUser(newUser)
        await fetchProfile(newUser)
      },
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      return await supabase.auth.signInWithPassword({ email, password })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } finally {
      // Clear state manually in case onAuthStateChange is slow or fails
      setUser(null)
      setSession(null)
      setProfile(null)
      setLoading(false)
    }
  }

  return { user, session, profile, signIn, signOut, loading }
}

