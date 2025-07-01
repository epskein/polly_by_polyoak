"use client"

import { useEffect, useState } from "react"
import { subDays, subMonths, isAfter } from "date-fns"
import { useIODData } from "../hooks/use-iod-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"

type DepartmentStats = {
  lastWeek: number
  outstandingInvestigations: number
  past6Months: number
  past12Months: number
}

type DepartmentStatsMap = {
  [department: string]: DepartmentStats
  total: DepartmentStats
}

export function DepartmentStatsTable() {
  const { data: incidents, isLoading } = useIODData()
  const [departmentStats, setDepartmentStats] = useState<DepartmentStatsMap>({
    total: {
      lastWeek: 0,
      outstandingInvestigations: 0,
      past6Months: 0,
      past12Months: 0,
    },
  })
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    if (!incidents || isLoading || incidents.length === 0) return

    try {
      const today = new Date()
      const lastWeekDate = subDays(today, 7)
      const sixMonthsAgo = subMonths(today, 6)
      const twelveMonthsAgo = subMonths(today, 12)

      const uniqueDepartments = [
        ...new Set(incidents.map((incident) => incident.department)),
      ].sort()
      setDepartments(uniqueDepartments)

      const stats: DepartmentStatsMap = {
        total: {
          lastWeek: 0,
          outstandingInvestigations: 0,
          past6Months: 0,
          past12Months: 0,
        },
      }

      uniqueDepartments.forEach((dept) => {
        stats[dept] = {
          lastWeek: 0,
          outstandingInvestigations: 0,
          past6Months: 0,
          past12Months: 0,
        }
      })

      incidents.forEach((incident) => {
        if (!incident.department) return

        const incidentDate = new Date(incident.incidentDate)
        const department = incident.department

        if (isAfter(incidentDate, lastWeekDate)) {
          stats[department].lastWeek++
          stats.total.lastWeek++
        }

        const status = incident.review?.reviewStatus || "NEW"
        if (
          ["NEW", "UNDER REVIEW", "INVESTIGATION NOT DONE"].includes(status)
        ) {
          stats[department].outstandingInvestigations++
          stats.total.outstandingInvestigations++
        }

        if (isAfter(incidentDate, sixMonthsAgo)) {
          stats[department].past6Months++
          stats.total.past6Months++
        }

        if (isAfter(incidentDate, twelveMonthsAgo)) {
          stats[department].past12Months++
          stats.total.past12Months++
        }
      })

      setDepartmentStats(stats)
    } catch (error) {
      console.error("Error calculating department statistics:", error)
    }
  }, [incidents, isLoading])

  if (isLoading) {
    return <div>Loading department statistics...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Metric</TableHead>
                {departments.map((dept) => (
                  <TableHead key={dept} className="text-center">
                    {dept}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Injuries Last Week
                </TableCell>
                {departments.map((dept) => (
                  <TableCell key={`${dept}-lastWeek`} className="text-center">
                    {departmentStats[dept]?.lastWeek || 0}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">
                  {departmentStats.total.lastWeek}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Outstanding Investigations
                </TableCell>
                {departments.map((dept) => (
                  <TableCell
                    key={`${dept}-outstanding`}
                    className={`text-center ${
                      departmentStats[dept]?.outstandingInvestigations > 0
                        ? "text-red-600 font-semibold"
                        : ""
                    }`}
                  >
                    {departmentStats[dept]?.outstandingInvestigations || 0}
                  </TableCell>
                ))}
                <TableCell
                  className={`text-center font-bold ${
                    departmentStats.total.outstandingInvestigations > 0
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {departmentStats.total.outstandingInvestigations}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Injuries Past 6 Months
                </TableCell>
                {departments.map((dept) => (
                  <TableCell key={`${dept}-6months`} className="text-center">
                    {departmentStats[dept]?.past6Months || 0}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">
                  {departmentStats.total.past6Months}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Injuries Past 12 Months
                </TableCell>
                {departments.map((dept) => (
                  <TableCell key={`${dept}-12months`} className="text-center">
                    {departmentStats[dept]?.past12Months || 0}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">
                  {departmentStats.total.past12Months}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 