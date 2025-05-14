"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../../context/AuthContext"
import Label from "../form/Label"
import Input from "../form/input/InputField"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate("/")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in")
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

          <div className="mb-5">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              
            />
          </div>

          {error && <div className="mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

          <div className="mb-5">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

