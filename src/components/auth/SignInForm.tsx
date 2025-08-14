"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { Input as UiInput } from "../ui/input/Input"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user } = useAuth()
  const [resetNotice, setResetNotice] = useState<string | null>(null)
  
  // Redirect if already authenticated
  useEffect(() => {
    // If redirected from password reset, do not auto-redirect even if a session is momentarily present
    const qs = new URLSearchParams(location.search)
    if (qs.get('reset') === '1') return
    // If user is logged in, redirect them.
    // The `from` property will exist if they were redirected from a protected route.
    if (user) {
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
  }, [user, navigate, location.state, location.search])

  // Show a one-off success notice after password reset
  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    if (qs.get('reset') === '1') setResetNotice('Your password was updated. Please sign in.')
  }, [location.search])

  async function handleSignIn() {
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email.trim(), password)
      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please check your credentials.")
      }
      // On success, the useEffect above will handle the redirect.
    } catch (err: any) {
      console.error("Sign in exception:", err)
      setError(err.message || "An unexpected error occurred during sign in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-screen lg:w-1/2">
      <div className="w-full max-w-[450px] px-5 py-8 sm:px-0">
        <div className="mb-8 text-center">
          <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">Sign In</h3>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
          <p className="mt-2 text-sm text-blue-500">If you don't have an account, please contact your administrator.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {resetNotice && (
            <div className="mb-5 p-3 text-sm text-green-600 bg-green-50 rounded-lg">{resetNotice}</div>
          )}
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

          <div className="mb-5">
            <Label htmlFor="password">Password</Label>
            <UiInput
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  e.preventDefault()
                  void handleSignIn()
                }
              }}
            />
          </div>

          {error && (
            <div className="mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-5">
            <button
              type="button"
              onClick={() => void handleSignIn()}
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center">
            <Link to="/auth/forgot" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

