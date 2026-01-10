"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DayClassificationChartProps {
  stats: {
    perfect: number
    average: number
    bad: number
  }
}

export function DayClassificationChart({ stats }: DayClassificationChartProps) {
  const data = [
    { name: "Perfect", value: stats.perfect, color: "hsl(142, 71%, 45%)" },
    { name: "Average", value: stats.average, color: "hsl(48, 96%, 53%)" },
    { name: "Bad", value: stats.bad, color: "hsl(0, 84%, 60%)" },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Day Classification</div>
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
      </div>
    )
  }

  return (
    <div className="space-y-2 py-5">
      {/* <div className="text-sm font-medium text-muted-foreground">Day Classification</div> */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
