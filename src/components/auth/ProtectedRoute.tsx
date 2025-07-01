import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
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

  // If not authenticated, redirect to sign in with return url
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />
  }

  // If authenticated, render the protected content
  return <>{children}</>
} 