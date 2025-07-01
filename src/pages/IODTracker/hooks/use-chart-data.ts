import { useMemo } from "react"
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { IODIncident } from "../types/iod"

export function useChartData(incidents: IODIncident[]) {
  const dailyIncidents = useMemo(() => {
    if (!incidents) return []

    const last30Days = Array.from({ length: 30 }, (_, i) =>
      subDays(new Date(), i),
    )
    const dailyData = last30Days.map((day) => {
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)
      const count = incidents.filter((incident) => {
        const incidentDate = new Date(incident.incidentDate)
        return isWithinInterval(incidentDate, { start: dayStart, end: dayEnd })
      }).length
      return {
        date: format(day, "MMM d"),
        incidents: count,
      }
    })
    return dailyData.reverse()
  }, [incidents])

  const departmentIncidents = useMemo(() => {
    if (!incidents) return []

    const departmentData = incidents.reduce(
      (acc, incident) => {
        const { department } = incident
        if (!acc[department]) {
          acc[department] = { department, incidents: 0 }
        }
        acc[department].incidents += 1
        return acc
      },
      {} as Record<string, { department: string; incidents: number }>,
    )

    return Object.values(departmentData)
  }, [incidents])

  return { dailyIncidents, departmentIncidents }
} 