import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export function AuthUrlRouter() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const hasRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery")
    if (hasRecovery && location.pathname !== "/reset-password") {
      navigate("/reset-password", { replace: true })
    }
  }, [location.pathname, navigate])

  return null
}


