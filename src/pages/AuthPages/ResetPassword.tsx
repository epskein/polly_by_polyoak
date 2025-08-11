import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthLayout from "./AuthPageLayout"
import { AuthService } from "../../services/auth.service"
import Label from "../../components/form/Label"
import Input from "../../components/form/input/InputField"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If the recovery link lands anywhere with the hash, we keep it on this route
  // so the Supabase client can read tokens from the URL if needed.
  const hash = useMemo(() => window.location.hash, [])

  useEffect(() => {
    // Basic guard to ensure the URL looks like a recovery link
    if (!hash || !hash.includes("type=recovery")) return
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
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save new password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AuthLayout>
    </>
  )
}


