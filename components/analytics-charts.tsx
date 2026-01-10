"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface AnalyticsChartsProps {
  habitsPerDay: number[]
  dailyScores: number[]
  daysInMonth: number
  selectedYear: number
  selectedMonth: number
  today: Date
}

export function AnalyticsCharts({
  habitsPerDay,
  dailyScores,
  daysInMonth,
  selectedYear,
  selectedMonth,
  today,
}: AnalyticsChartsProps) {
  const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth()
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth

  const data = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    habits: i < elapsedDays ? habitsPerDay[i] : null,
    score: i < elapsedDays ? dailyScores[i] : null,
  }))

  return (
    <div className="h-70 bg-card rounded-lg ">
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 60, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="habitsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            tick={{ fill: "white", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "white", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: "Habits",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--foreground))",
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: "Score %",
              angle: 90,
              position: "insideRight",
              fill: "hsl(var(--foreground))",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              color: "hsl(var(--foreground))",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number | undefined, name: string | undefined) => [
              value != null ? (name === "score" ? `${value}%` : value) : "N/A",
              name === "score" ? "Discipline Score" : "Habits Completed",
            ]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--foreground))" }}>
                {value === "habits" ? "Habits Completed" : "Discipline Score"}
              </span>
            )}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="habits"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={2}
            fill="url(#habitsGradient)"
            dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "hsl(142, 71%, 45%)" }}
            connectNulls
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="score"
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "hsl(217, 91%, 60%)" }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}