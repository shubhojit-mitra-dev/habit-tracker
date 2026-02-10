import { Progress } from "@/components/ui/progress"
import { isHabitCompleted } from "@/lib/habit-utils"
import type { Habit, CompletionMatrix } from "@/lib/types"

interface MonthlyProgressProps {
  habits: Habit[]
  daysInMonth: number
  selectedYear: number
  selectedMonth: number
  completions: CompletionMatrix
  today: Date
}

export function MonthlyProgress({
  habits,
  daysInMonth,
  selectedYear,
  selectedMonth,
  completions,
  today,
}: MonthlyProgressProps) {
  const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth()
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth

  const getProgress = (habitId: string) => {
    let completed = 0
    for (let day = 1; day <= elapsedDays; day++) {
      const dateKey = `${selectedYear}-${selectedMonth}-${day}`
      if (isHabitCompleted(habitId, dateKey, completions)) {
        completed++
      }
    }
    return Math.round((completed / elapsedDays) * 100)
  }

  return (
    <div className="space-y-3">
      {/* <div className="text-sm font-medium text-muted-foreground">Monthly Progress</div> */}
      {habits.map((habit) => {
        const progress = getProgress(habit.id)
        return (
          <div key={habit.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-foreground truncate max-w-30">{habit.name}</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )
      })}
    </div>
  )
}
