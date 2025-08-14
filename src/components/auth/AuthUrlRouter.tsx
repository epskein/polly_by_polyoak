import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export function AuthUrlRouter() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Detect Supabase recovery links that include tokens in the URL hash.
    // When redirecting to `/reset-password`, preserve the existing search and hash so tokens are not lost.
    const hasRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery")
    if (hasRecovery && location.pathname !== "/reset-password") {
      navigate({
        pathname: "/reset-password",
        search: location.search,
        hash: location.hash,
      }, { replace: true })
    }
  }, [location.pathname, navigate])

  return null
}


