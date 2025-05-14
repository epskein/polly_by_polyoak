"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "../types/database.types"

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getActiveSession() {
      setLoading(true)

       // maybe trigger logout or clear session manually
      const { data } = await supabase.auth.getSession()

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        setProfile(profileData)
      }

      setLoading(false)
    }

    getActiveSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, session, profile, signIn, signOut, loading }
}

