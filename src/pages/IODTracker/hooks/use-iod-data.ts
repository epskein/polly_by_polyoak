import { useState, useEffect, useCallback } from "react"
import type { IODIncident } from "../types/iod"
import { db } from "../lib/db"

export function useIODData() {
  const [data, setData] = useState<IODIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [timestamp, setTimestamp] = useState(Date.now()) // Add timestamp for forcing refresh

  const fetchData = useCallback(() => {
    try {
      // Create a deep copy of the data to ensure React detects changes
      setData(JSON.parse(JSON.stringify(db.incidents)))
      setIsLoading(false)
      setTimestamp(Date.now()) // Update timestamp
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    setIsLoading(true)
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch, timestamp }
} 