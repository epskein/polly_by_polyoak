"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: string | null
  role_id: string | null
  role_ref?: { name: string }
  roles?: { name: string }
}

export function useAuthImplementation() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfile = useCallback(async (userToFetch: User | null) => {
    if (!userToFetch) {
      setProfile(null)
      return
    }
    try {
      // Fetch profile and include the joined role name via FK (profiles.role_id -> roles.id)
      // We alias the joined object to role_ref to avoid clashing with any existing text column 'role'
      let { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, phone, role, role_id, roles:roles!profiles_role_id_fkey(name)")
        .eq("id", userToFetch.id)
        .single()
      if (error) {
        // Fallback: try without explicit FK name
        const fallback = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name, phone, role, role_id, roles(name)")
          .eq("id", userToFetch.id)
          .single()
        data = fallback.data as any
        error = fallback.error as any
      }
      if (error) throw error
      // If join did not resolve role name but we have role_id, fetch role name explicitly
      let profileData = data as unknown as UserProfile
      if (!profileData?.roles?.name && profileData?.role_id) {
        const { data: roleRow } = await supabase
          .from("roles")
          .select("name")
          .eq("id", profileData.role_id)
          .single()
        if (roleRow?.name) profileData = { ...profileData, roles: { name: roleRow.name } }
      }
      setProfile(profileData)
    } catch (err) {
      console.error("Failed to fetch profile", err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    // This effect runs once on mount to get the initial session and set up the listener.
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      // If a session is found, fetch the profile
      if (initialSession) {
        setUser(initialSession.user);
        setSession(initialSession);
        await fetchProfile(initialSession.user);
      }
      
      // IMPORTANT: Set loading to false only after the initial check is complete.
      setLoading(false);

      // Set up the auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          // When auth state changes, update the user, session, and profile.
          setUser(newSession?.user ?? null);
          setSession(newSession);
          if (newSession?.user) {
            await fetchProfile(newSession.user);
          } else {
            setProfile(null);
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    };

    const unsubscribe = getInitialSession();

    return () => {
      // Cleanup the subscription when the component unmounts.
      unsubscribe.then(cleanup => cleanup && cleanup());
    };
  }, [fetchProfile]);


  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      return await supabase.auth.signInWithPassword({ email, password })
    } finally {
       // The onAuthStateChange listener will handle setting user/profile state.
       // We'll set loading to false here to ensure responsiveness if the listener is slow.
       setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    // The onAuthStateChange listener will clear the user/profile state.
    setLoading(false)
  }

  return { user, session, profile, signIn, signOut, loading }
}
