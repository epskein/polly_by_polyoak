import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // If not authenticated, redirect to sign in
  if (!user) {
    // Redirect them to the /sign-in page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to="/auth/signin" state={{ from: location }} replace />
  }

  // If authenticated, render the protected content
  return <>{children}</>
} 