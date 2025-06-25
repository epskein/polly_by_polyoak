"use client"

import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

import Card from "../../../components/common/ComponentCard"
import type { Job } from "../types/job"
import {
  subMonths,
  isAfter,
  startOfYear,
  isWithinInterval,
  parseISO,
  subYears,
  endOfYear,
} from "date-fns"
import {
  DemoBarChart,
  DemoBarChart2,
  DemoBarChart3,
  DemoLineGraph,
} from "./PlaceholderChart" // adjust path if needed

interface AnalyticsProps {
  jobs: Job[]
}

interface DivisionsPieChartProps {
  data: {
    name: string
    y: number
    z: number
  }[]
}

function DivisionsPieChart({ data }: DivisionsPieChartProps) {
  const options: Highcharts.Options = {
    chart: {
      type: "variablepie",
      height: 300,
      style: {
        fontFamily: `Outfit, sans-serif`,
      },
      backgroundColor: "transparent",
    },
    title: {
      text: "",
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
        "Outstanding Tasks: <b>{point.y}</b><br/>" +
        "Percentage: <b>{point.z:.1f}%</b><br/>",
    },
    series: [
      {
        type: "variablepie",
        name: "Divisions",
        minPointSize: 10,
        innerSize: "20%",
        zMin: 0,
        borderRadius: 5,
        size: "100%",
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            color: "#000000",
            textAlign: "center",
            fontSize: "10px",
            fontWeight: "normal",
            textOutline: "none",
          },
        },
        data: data,
        colors: [
          "#1b98e0",
          "#00a8e8",
          "#007ea7",
          "#005377",
          "#ff595e",
          "#2ec4b6",
          "#0f4c5c",
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}

interface AssigneeTasksChartProps {
  categories: string[]
  completedData: number[]
  outstandingData: number[]
}

function AssigneeTasksChart({
  categories,
  completedData,
  outstandingData,
}: AssigneeTasksChartProps) {
  const options: Highcharts.Options = {
    chart: {
      type: "column",
      height: 300,
      backgroundColor: "transparent",
      style: {
        fontFamily: `Outfit, sans-serif`,
      },
    },
    title: { text: "" },
    xAxis: {
      categories,
      labels: {
        style: {
          color: "#A1A1AA", // zinc-400
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Tasks",
        style: {
          color: "#A1A1AA", // zinc-400
        },
      },
      labels: {
        style: {
          color: "#A1A1AA", // zinc-400
        },
      },
      gridLineColor: "#3F3F46", // zinc-700
    },
    legend: {
      itemStyle: {
        color: "#A1A1AA", // zinc-400
      },
    },
    series: [
      {
        name: "Completed",
        type: "column",
        data: completedData,
        color: "#3b82f6", // blue-500
      },
      {
        name: "Outstanding",
        type: "column",
        data: outstandingData,
        color: "#ef4444", // red-500
      },
    ],
    credits: { enabled: false },
  }
  return <HighchartsReact highcharts={Highcharts} options={options} />
}

export function Analytics({ jobs }: AnalyticsProps) {
  // Get current date and calculate date ranges
  const now = new Date()
  const oneMonthAgo = subMonths(now, 1)
  const currentYearStart = startOfYear(now)
  const lastYearStart = startOfYear(subYears(now, 1))
  const lastYearEnd = endOfYear(subYears(now, 1))

  // Filter tasks created this year to date
  const tasksThisYear = jobs.filter(job => {
    if (!job.created_at) return false
    const createdDate = parseISO(job.created_at)
    return isWithinInterval(createdDate, { start: currentYearStart, end: now })
  })

  // Filter tasks created last year
  const tasksLastYear = jobs.filter(job => {
    if (!job.created_at) return false
    const createdDate = parseISO(job.created_at)
    return isWithinInterval(createdDate, { start: lastYearStart, end: lastYearEnd })
  })

  // Filter completed tasks
  const completedTasks = jobs.filter(job => job.job_status?.description === "Completed")

  // Filter completed tasks in the last month
  const completedLastMonth = jobs.filter(job => {
    if (job.job_status?.description !== "Completed" || !job.completion_date) return false
    return isAfter(job.completion_date, oneMonthAgo)
  })

  // Filter completed tasks in the year to date
  const completedYearToDate = jobs.filter(job => {
    if (job.job_status?.description !== "Completed" || !job.completion_date) return false
    return isWithinInterval(job.completion_date, { start: currentYearStart, end: now })
  })

  // Filter outstanding tasks (not completed)
  const outstandingTasks = jobs.filter(job => job.job_status?.description !== "Completed")

  // Calculate percentages
  const totalJobs = jobs.length
  const completedPercentage =
    totalJobs > 0 ? Math.round((completedTasks.length / totalJobs) * 100) : 0
  const outstandingPercentage =
    totalJobs > 0 ? Math.round((outstandingTasks.length / totalJobs) * 100) : 0

  const totalOutstanding = outstandingTasks.length

  const outstandingByDivision = outstandingTasks.reduce(
    (acc, job) => {
      const divisionName = job.production_plant?.name || "Unassigned"
      acc[divisionName] = (acc[divisionName] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const divisionsPieData = Object.entries(outstandingByDivision).map(([name, count]) => ({
    name: name,
    y: count,
    z: totalOutstanding > 0 ? (count / totalOutstanding) * 100 : 0,
  }))

  const tasksByAssignee = jobs.reduce(
    (acc, job) => {
      const assigneeName =
        job.profiles?.first_name && job.profiles?.last_name
          ? `${job.profiles.first_name} ${job.profiles.last_name}`
          : "Unassigned"

      if (!acc[assigneeName]) {
        acc[assigneeName] = { completed: 0, outstanding: 0 }
      }

      if (job.job_status?.description === "Completed") {
        acc[assigneeName].completed += 1
      } else {
        acc[assigneeName].outstanding += 1
      }

      return acc
    },
    {} as Record<string, { completed: number; outstanding: number }>,
  )

  const assigneeCategories = Object.keys(tasksByAssignee)
  const assigneeCompletedData = assigneeCategories.map(
    assignee => tasksByAssignee[assignee].completed,
  )
  const assigneeOutstandingData = assigneeCategories.map(
    assignee => tasksByAssignee[assignee].outstanding,
  )

  console.log("Assignee Chart Data:", {
    categories: assigneeCategories,
    completed: assigneeCompletedData,
    outstanding: assigneeOutstandingData,
  })

  // Group by analyst (assignedTo)
  const completedByAnalyst = groupBy(completedLastMonth, "assignedTo")
  const outstandingByAnalyst = groupBy(outstandingTasks, "assignedTo")

  // Group by requestor
  const completedByRequestor = groupBy(completedYearToDate, "requestor", "name")
  const outstandingByRequestor = groupBy(outstandingTasks, "requestor", "name")

  return (
    <div>
      <div className="flex justify-between gap-4 p-4">
        {/* Tasks this year to date */}
        <div className="flex-1 rounded-xl bg-gray-50 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tasks This Year to Date</p>
          <p className="text-2xl font-bold text-gray-800">{tasksThisYear.length}</p>
        </div>

        {/* Tasks last year */}
        <div className="flex-1 rounded-xl bg-gray-50 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tasks Last Year</p>
          <p className="text-2xl font-bold text-gray-800">{tasksLastYear.length}</p>
        </div>

        {/* Completed Tasks */}
        <div className="flex-1 rounded-xl bg-green-50 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Completed Tasks</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-green-700">{completedTasks.length}</p>
            <p className="text-sm text-green-600">{completedPercentage}%</p>
          </div>
        </div>

        {/* Outstanding Tasks */}
        <div className="flex-1 rounded-xl bg-red-50 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Outstanding Tasks</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-red-700">{outstandingTasks.length}</p>
            <p className="text-sm text-red-600">{outstandingPercentage}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title={"No. of Tasks (Current Year VS Prev. Year)"}>
            <div className="space-y-2">
              <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    transform: "scale(0.8)",
                    transformOrigin: "top left",
                    width: "125%",
                    height: "125%",
                    position: "absolute",
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

        <Card title={"Outstanding Tasks by Division"}>
          <div className="space-y-2">
            <DivisionsPieChart data={divisionsPieData} />
          </div>
        </Card>

        <Card title={"Outstanding/Overdue Tasks by Assignee"}>
          <div className="h-[350px] space-y-2">
            <AssigneeTasksChart
              categories={assigneeCategories}
              completedData={assigneeCompletedData}
              outstandingData={assigneeOutstandingData}
            />
          </div>
        </Card>

        <Card title={"Tasks by Requestor"}>
          <div className="space-y-2">
            {/* Chart container with fixed height to preserve layout */}
            <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  transform: "scale(0.8)",
                  transformOrigin: "top left",
                  width: "125%",
                  height: "125%",
                  position: "absolute",
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
            <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  transform: "scale(0.8)",
                  transformOrigin: "top left",
                  width: "125%",
                  height: "125%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <DemoBarChart3 />
              </div>
            </div>
          </div>
        </Card>

        <Card title={"No. of Tasks by Requestor (Year to Date)"}>
          <div className="space-y-2">
            {/* Chart container with fixed height to preserve layout */}
            <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  transform: "scale(0.8)",
                  transformOrigin: "top left",
                  width: "125%",
                  height: "125%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <DemoBarChart />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Helper function
function groupBy(array: any[], key: string, nestedKey?: string) {
  return array.reduce((result, item) => {
    let groupKey: string
    if (nestedKey && item[key] && typeof item[key] === "object") {
      groupKey = item[key][nestedKey] || "Unassigned"
    } else {
      // Fallback for non-nested or simple properties
      groupKey = item[key] || "Unassigned"
    }

    // Ensure the key exists in the result object
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

