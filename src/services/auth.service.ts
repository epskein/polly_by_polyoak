import { supabase } from "../lib/supabase"

export interface SignUpCredentials {
  email: string
  password: string
  fullName?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export const AuthService = {
  signUp: async ({ email, password, fullName }: SignUpCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || "",
          },
        },
      })

      if (error) throw error

      // Create a profile for the user
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName || "",
          email,
        })

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error signing up:", error)
      return { data: null, error }
    }
  },

  signIn: async ({ email, password }: SignInCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error signing in:", error)
      return { data: null, error }
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Error signing out:", error)
      return { error }
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Error resetting password:", error)
      return { error }
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Error updating password:", error)
      return { error }
    }
  },

  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      console.error("Error getting current user:", error)
      return { user: null, error }
    }
  },

  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session: data.session, error: null }
    } catch (error) {
      console.error("Error getting session:", error)
      return { session: null, error }
    }
  },
}

