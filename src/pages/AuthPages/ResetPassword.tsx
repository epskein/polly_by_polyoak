import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthLayout from "./AuthPageLayout"
import { AuthService } from "../../services/auth.service"
import Label from "../../components/form/Label"
import Input from "../../components/form/input/InputField"
import { supabase } from "../../lib/supabase"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)

  // If the recovery link lands anywhere with the hash, we keep it on this route
  // so the Supabase client can read tokens from the URL if needed.
  const hash = useMemo(() => window.location.hash, [])

  useEffect(() => {
    // Attempt to establish a session from URL parameters when arriving via recovery link
    async function establishSessionFromUrl() {
      try {
        // First, handle code param (PKCE) style
        const search = new URLSearchParams(window.location.search)
        const code = search.get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setIsSessionReady(Boolean(data?.session))
          return
        }

        // Fallback: handle hash fragment tokens style
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        const isRecovery = hashParams.get('type') === 'recovery'
        const access_token = hashParams.get('access_token') || undefined
        const refresh_token = hashParams.get('refresh_token') || undefined
        if (isRecovery && access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          setIsSessionReady(Boolean(data?.session))
          return
        }

        // If we get here, check if a session is already present (user might already be signed in)
        const { data: sess } = await supabase.auth.getSession()
        setIsSessionReady(Boolean(sess.session))
      } catch (e) {
        console.error('[ResetPassword] Failed to establish session from URL:', e)
        setIsSessionReady(false)
      }
    }

    void establishSessionFromUrl()
  }, [hash])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    // Ensure we have a recovery session before attempting to update password
    if (!isSessionReady) {
      setIsSubmitting(false)
      setError("Recovery session not established. Please use the password reset link sent to your email again.")
      return
    }
    const { error: updateError } = await AuthService.updatePassword(password)
    setIsSubmitting(false)

    if (updateError) {
      setError(updateError.message || "Failed to set new password")
      return
    }

    setSuccess("Your password has been updated. You can now sign in.")
    setTimeout(() => navigate("/auth/signin", { replace: true }), 1200)
  }

  return (
    <>
      <AuthLayout>
        <div className="flex items-center justify-center w-full h-screen lg:w-1/2">
          <div className="w-full max-w-[450px] px-5 py-8 sm:px-0">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">Set a new password</h3>
              <p className="text-gray-500 dark:text-gray-400">Enter and confirm your new password</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  type="password"
                  id="new-password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  type="password"
                  id="confirm-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>
              )}
              {success && (
                <div className="mb-5 p-3 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>
              )}

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={isSubmitting || !isSessionReady}
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : (!isSessionReady ? "Waiting for recovery session..." : "Save new password")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AuthLayout>
    </>
  )
}


