"use client"

import Card from "../../../components/common/ComponentCard"
import CardContent from "../../../components/common/ComponentCard"
import type { Job } from "../types/job"
import { subMonths, isAfter, startOfYear, isWithinInterval, parseISO } from "date-fns"
import { PlaceholderBarChart, PlaceholderBarChart2, PlaceholderBarChart3, PlaceholderPieChart, PlaceholderPieChart2, PlaceholderPieChart3, DemoLineGraph, DemoBarChart, DemoBarChart2, DemoBarChart3 } from "./PlaceholderChart"; // adjust path if needed



interface AnalyticsProps {
  jobs: Job[]
}

export function Analytics({ jobs }: AnalyticsProps) {
  // Get current date and calculate date ranges
  const now = new Date()
  const oneMonthAgo = subMonths(now, 1)
  const yearStart = startOfYear(now)

  // Filter completed tasks in the last month
  const completedLastMonth = jobs.filter((job) => {
    if (job.job_status?.description !== "Completed" || !job.completion_date) return false
    try {
      const completedDate = parseISO(job.completion_date)
      return isAfter(completedDate, oneMonthAgo)
    } catch (error) {
      console.error("Error parsing completionDate:", error)
      return false
    }
  })

  // Filter completed tasks in the year to date
  const completedYearToDate = jobs.filter((job) => {
    if (job.job_status?.description !== "Completed" || !job.completion_date) return false
    try {
      const completedDate = parseISO(job.completion_date)
      return isWithinInterval(completedDate, { start: yearStart, end: now })
    } catch (error) {
      console.error("Error parsing completionDate:", error)
      return false
    }
  })

  // Filter outstanding tasks (not completed)
  const outstandingTasks = jobs.filter((job) => job.job_status?.description !== "Completed")

  // Group by analyst (assignedTo)
  const completedByAnalyst = groupBy(completedLastMonth, "assignedTo")
  const outstandingByAnalyst = groupBy(outstandingTasks, "assignedTo")

  // Group by division
  const completedByDivision = groupBy(completedLastMonth, "division")
  const outstandingByDivision = groupBy(outstandingTasks, "division")

  // Group by requestor
  const completedByRequestor = groupBy(completedYearToDate, "requestor")
  const outstandingByRequestor = groupBy(outstandingTasks, "requestor")

  return (
    <div>
      <div className="flex justify-between gap-4 p-4">
        {/* Tasks this year to date */}
        <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Tasks This Year to Date</p>
          <p className="text-2xl font-bold text-gray-800">1,245</p>
        </div>

        {/* Tasks last year */}
        <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Tasks Last Year</p>
          <p className="text-2xl font-bold text-gray-800">980</p>
        </div>

        {/* Completed Tasks */}
        <div className="flex-1 bg-green-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Completed Tasks</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-green-700">875</p>
            <p className="text-sm text-green-600">87%</p>
          </div>
        </div>

        {/* Outstanding Tasks */}
        <div className="flex-1 bg-red-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Outstanding Tasks</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-red-700">130</p>
            <p className="text-sm text-red-600">13%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Pie Charts - Simplified as basic cards with data */}
        {/* <Card title={"Completed Tasks by Analyst"} >
          <p className="text-sm text-muted-foreground">Last month</p>
        
          <div className="space-y-2">
          <PlaceholderPieChart />
            {Object.entries(completedByAnalyst).map(([name, items]) => (
              <div key={name} className="flex justify-between items-center">
                <span>{name || "Unassigned"}</span>
                <span className="font-semibold"></span>
              </div>
            ))}
            {Object.keys(completedByAnalyst).length === 0 && (
              <div className="text-center text-muted-foreground py-4">No data available</div>
            )}
          </div>
      </Card> */}
        <div className="lg:col-span-2">

          <Card title={"No. of Tasks (Current Year VS Prev. Year)"} >
            <div className="space-y-2">
              <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    transform: 'scale(0.8)',
                    transformOrigin: 'top left',
                    width: '125%',
                    height: '125%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <DemoLineGraph />

                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card title={"Outstanding Tasks by Division"} >
          <div className="space-y-2">
            <PlaceholderPieChart2 />
          </div>
        </Card>


        <Card title={"Outstanding/Overdue Tasks by Assignee"}>
          <div className="space-y-2">
            {/* Chart container with fixed height to preserve layout */}
            <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left',
                  width: '125%',
                  height: '125%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <DemoBarChart />
              </div>
            </div>
          </div>
        </Card>

        <Card title={"Tasks by Requestor"}>
          <div className="space-y-2">
            {/* Chart container with fixed height to preserve layout */}
            <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left',
                  width: '125%',
                  height: '125%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <DemoBarChart2 />
              </div>
            </div>
          </div>
        </Card>

        <Card title={"Tasks by Priority"}>
          <div className="space-y-2">
            {/* Chart container with fixed height to preserve layout */}
            <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left',
                  width: '125%',
                  height: '125%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <DemoBarChart3 />
              </div>
            </div>
          </div>
        </Card>


      </div>
    </div>


  )
}

// Helper function
function groupBy(array: any[], key: string) {
  return array.reduce((result, item) => {
    const groupKey = item[key] || "Unassigned"
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
    return result
  }, {})
}

