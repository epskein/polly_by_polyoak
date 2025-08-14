import { useEffect, useState } from "react"
import AuthLayout from "./AuthPageLayout"
import { AuthService } from "../../services/auth.service"
import Label from "../../components/form/Label"
import Input from "../../components/form/input/InputField"
import { supabase } from "../../lib/supabase"

export default function ResetPassword() {
  // Proactively clear any error hash fragments from the URL since we now use manual OTP
  useEffect(() => {
    try {
      if (window.location.hash && window.location.hash.includes('error=')) {
        const url = window.location.pathname + window.location.search
        window.history.replaceState(null, '', url)
      }
    } catch {}
  }, [])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)

  // Manual OTP verification flow is used. The password form is shown only after OTP verification creates a session.
  // If success is set, show confirmation and redirect shortly after, irrespective of session changes.
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => {
      try { window.location.replace("/auth/signin?reset=1") } catch {}
    }, 800)
    return () => clearTimeout(timer)
  }, [success])

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

    // Ensure we have a recovery session from OTP verification before attempting to update password
    const { data: sess } = await supabase.auth.getSession()
    if (!sess.session) {
      setIsSubmitting(false)
      setError("Session not established after OTP verification. Please verify the OTP again or request a new code.")
      return
    }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message || "Failed to set new password")
        return
      }
      // Show confirmation and unblock UI; redirect is handled by success-effect above
      setSuccess("Your password has been updated. Redirecting to sign in…")
      setIsSubmitting(false)
    } catch (err: any) {
      setError(err?.message || "Failed to set new password")
    } finally {
      setIsSubmitting(false)
    }
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

            {!isSessionReady && (
              <div className="mb-6">
                <VerifyOtpSection onVerified={() => setIsSessionReady(true)} />
              </div>
            )}

            {isSessionReady && (
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
            )}

            {!isSessionReady && (
              <div className="mt-4 space-y-3">
                <div className="text-center text-xs text-gray-500">— or —</div>
                <div className="text-center">
                  <ResendResetLink />
                </div>
              </div>
            )}
          </div>
        </div>
      </AuthLayout>
    </>
  )
}

interface VerifyOtpSectionProps {
  onVerified: () => void
}

function VerifyOtpSection({ onVerified }: VerifyOtpSectionProps) {
  const [email, setEmail] = useState<string>(() => {
    try { return localStorage.getItem('polly-reset-email') || '' } catch { return '' }
  })
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email) { setError('Enter your email'); return }
    if (!otp) { setError('Enter the OTP from your email'); return }
    setIsVerifying(true)
    try {
      const verifyPromise = supabase.auth.verifyOtp({ email, token: otp.trim(), type: 'recovery' })
      const timeoutPromise = new Promise<{ error: any }>((resolve) => {
        setTimeout(() => resolve({ error: { message: 'Verification timed out. Please try again.' } }), 10000)
      })
      const result = await Promise.race([verifyPromise, timeoutPromise]) as { error?: any }
      const verifyError = (result as any)?.error
      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired OTP')
        return
      }
      // Clean any error hash from URL to avoid confusion and proceed to show password form
      try {
        const url = window.location.pathname + window.location.search
        window.history.replaceState(null, '', url)
      } catch {}
      setMessage('Verified. You can now set a new password.')
      onVerified()
    } catch (err: any) {
      setError(err?.message || 'Failed to verify OTP')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <form onSubmit={onVerify} className="space-y-3">
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Verify OTP</div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
        />
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit OTP"
          className="w-36 rounded-md border border-gray-300 px-3 py-2 text-sm tracking-widest text-center dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={isVerifying}
          className="rounded-md bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
      {message && <div className="text-xs text-green-600">{message}</div>}
    </form>
  )
}

function ResendResetLink() {
  const [email, setEmail] = useState<string>(() => {
    try { return localStorage.getItem('polly-reset-email') || '' } catch { return '' }
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  async function onResend(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!email) {
      setError('Enter your email to resend the link')
      return
    }
    setIsSending(true)
    const { error: resetError } = await AuthService.resetPassword(email)
    setIsSending(false)
    if (resetError) {
      setError((resetError as any)?.message || 'Failed to resend link')
      return
    }
    setMessage('A new reset link has been sent if the email exists.')
  }

  return (
    <form onSubmit={onResend} className="space-y-2">
      <div className="text-xs text-gray-600 dark:text-gray-300">Having trouble? Resend a new link:</div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {isSending ? 'Sending...' : 'Resend link'}
        </button>
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
      {message && <div className="text-xs text-green-600">{message}</div>}
    </form>
  )
}


