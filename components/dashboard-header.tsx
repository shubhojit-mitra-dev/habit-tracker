import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flame, CalendarCheck, TrendingUp, Calendar } from "lucide-react"

interface DashboardHeaderProps {
  currentStreak: number
  lastPerfectDay: string
  disciplineScore: number
  selectedMonth: string
  selectedMonthIndex: number
  onMonthChange: (monthIndex: number) => void
  availableMonths: string[]
}

export function DashboardHeader({
  currentStreak,
  lastPerfectDay,
  disciplineScore,
  selectedMonthIndex,
  onMonthChange,
  availableMonths,
}: DashboardHeaderProps) {
  const metrics = [
    {
      label: "Current Streak",
      value: `${currentStreak} day${currentStreak !== 1 ? "s" : ""}`,
      icon: Flame,
      isSelect: false,
    },
    {
      label: "Last Perfect Day",
      value: lastPerfectDay,
      icon: CalendarCheck,
      isSelect: false,
    },
    {
      label: "Discipline Score",
      value: `${disciplineScore}%`,
      icon: TrendingUp,
      isSelect: false,
    },
    {
      label: "Month",
      value: availableMonths[selectedMonthIndex],
      icon: Calendar,
      isSelect: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card rounded-none border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-between h-full w-full">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <div className="font-semibold ml-2 text-foreground">
                  {metric.isSelect ? (
                    <Select value={selectedMonthIndex.toString()} onValueChange={(v) => onMonthChange(Number.parseInt(v))}>
                      <SelectTrigger className="w-auto h-auto text-sm p-0 border-0 bg-transparent font-semibold text-foreground hover:bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMonths.map((month, idx) => (
                          <SelectItem key={month} value={idx.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                   <p className="text-lg">{metric.value}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}