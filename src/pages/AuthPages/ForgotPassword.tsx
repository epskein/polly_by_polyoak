import { useState } from "react"
import AuthLayout from "./AuthPageLayout"
import { AuthService } from "../../services/auth.service"
import Label from "../../components/form/Label"
import Input from "../../components/form/input/InputField"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    const { error: resetError } = await AuthService.resetPassword(email)
    setIsSubmitting(false)

    if (resetError) {
      setError(resetError.message || "Failed to send reset email")
      return
    }

    // Persist the email locally to allow the reset page to offer a quick resend if the link is consumed by scanners.
    try { localStorage.setItem('polly-reset-email', email) } catch {}

    setSuccess("If an account exists for this email, a reset link has been sent.")
  }

  return (
    <AuthLayout>
      <div className="flex items-center justify-center w-full h-screen lg:w-1/2">
        <div className="w-full max-w-[450px] px-5 py-8 sm:px-0">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">Forgot password</h3>
            <p className="text-gray-500 dark:text-gray-400">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}


