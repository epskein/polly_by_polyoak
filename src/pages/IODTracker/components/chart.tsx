"use client"

import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"

interface ChartProps {
  data: any[]
  categories?: string[]
  index: string
  colors?: string[]
  className?: string
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
}

export function LineChart({
  data,
  categories = ["value"],
  index,
  colors = ["hsl(var(--primary))"],
  className,
  valueFormatter = (value: number) => String(value),
  yAxisWidth = 40,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={index} />
          <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
          <Tooltip
            formatter={(value) => [valueFormatter(value as number), ""]}
          />
          <Legend />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart({
  data,
  categories = ["value"],
  index,
  colors = ["hsl(var(--primary))"],
  className,
  valueFormatter = (value: number) => String(value),
  yAxisWidth = 40,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={index} />
          <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
          <Tooltip
            formatter={(value) => [valueFormatter(value as number), ""]}
          />
          <Legend />
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
} 