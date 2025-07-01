import { useEffect, useState } from "react"
import {
  differenceInDays,
  isWithinInterval,
  startOfYear,
  endOfYear,
  format,
} from "date-fns"
import { useIODData } from "../hooks/use-iod-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { CalendarDays, AlertTriangle, Clock } from "lucide-react"
import { LineChart, BarChart } from "./chart"
import { DepartmentStatsTable } from "./DepartmentStatsTable"
import { useChartData } from "../hooks/use-chart-data"

export function DashboardOverview() {
  const { data: incidents, isLoading } = useIODData()
  const { dailyIncidents, departmentIncidents } = useChartData(incidents || [])
  const [metrics, setMetrics] = useState({
    totalInjuriesYTD: 0,
    accidentFreeDaysYTD: 0,
    totalLostDays: 0,
  })

  useEffect(() => {
    if (!incidents || isLoading || incidents.length === 0) return

    try {
      const yearStart = startOfYear(new Date())
      const today = new Date()

      const incidentsThisYear = incidents.filter((incident) => {
        const incidentDate = new Date(incident.incidentDate)
        return isWithinInterval(incidentDate, { start: yearStart, end: today })
      })

      const totalInjuriesYTD = incidentsThisYear.length

      let accidentFreeDaysYTD = 0
      if (incidentsThisYear.length > 0) {
        const sortedIncidents = [...incidentsThisYear].sort(
          (a, b) =>
            new Date(b.incidentDate).getTime() -
            new Date(a.incidentDate).getTime(),
        )

        const mostRecentIncidentDate = new Date(sortedIncidents[0].incidentDate)

        accidentFreeDaysYTD = differenceInDays(today, mostRecentIncidentDate)
      } else {
        accidentFreeDaysYTD = differenceInDays(today, yearStart)
      }

      const totalLostDays = incidents.reduce((total, incident) => {
        return total + (incident.daysBookedOff || 0)
      }, 0)

      setMetrics({
        totalInjuriesYTD,
        accidentFreeDaysYTD,
        totalLostDays,
      })
    } catch (error) {
      console.error("Error calculating dashboard metrics:", error)
    }
  }, [incidents, isLoading])

  if (isLoading) {
    return <div>Loading dashboard data...</div>
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Total Injuries
            </CardTitle>
            <CardDescription>Year to date ({currentYear})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metrics.totalInjuriesYTD}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Total incidents reported since{" "}
              {format(startOfYear(new Date()), "MMMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-green-500" />
              Accident-Free Days
            </CardTitle>
            <CardDescription>Year to date ({currentYear})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {metrics.accidentFreeDaysYTD}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Days since the last reported incident
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Clock className="mr-2 h-5 w-5 text-red-500" />
              Total Lost Days
            </CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metrics.totalLostDays}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Total work days lost due to injuries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incident Frequency</CardTitle>
            <CardDescription>
              Number of incidents per day (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {dailyIncidents && dailyIncidents.length > 0 ? (
              <LineChart
                data={dailyIncidents}
                index="date"
                categories={["incidents"]}
                colors={["#f59e0b"]}
                valueFormatter={(value) =>
                  `${value} incident${value !== 1 ? "s" : ""}`
                }
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No incident data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Injuries by Department</CardTitle>
            <CardDescription>
              Department-wise incident count ({currentYear})
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {departmentIncidents && departmentIncidents.length > 0 ? (
              <BarChart
                data={departmentIncidents}
                index="department"
                categories={["incidents"]}
                colors={["#3b82f6"]}
                valueFormatter={(value) =>
                  `${value} incident${value !== 1 ? "s" : ""}`
                }
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No incident data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DepartmentStatsTable />
    </div>
  )
} 