"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface Student {
  username: string
  performance: { date: string; score: number }[]
}

interface PerformanceChartProps {
  data: Student[]
}

const colors = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"]

export function PerformanceChart({ data }: PerformanceChartProps) {
  // Transform data for the chart
  const chartData =
    data[0]?.performance.map((point, index) => {
      const dataPoint: any = { date: point.date }

      data.forEach((student, studentIndex) => {
        if (student.performance[index]) {
          dataPoint[student.username] = student.performance[index].score
        }
      })

      return dataPoint
    }) || []

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tickFormatter={formatDate} className="text-xs fill-muted-foreground" />
          <YAxis className="text-xs fill-muted-foreground" />
          <Tooltip
            labelFormatter={(value) => formatDate(value as string)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend />
          {data.map((student, index) => (
            <Line
              key={student.username}
              type="monotone"
              dataKey={student.username}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
