"use client"

import { cn } from "@/lib/utils"
import { getDayOfWeek, getDayLetter, isToday, isYesterday, isFutureDay } from "@/lib/date-utils"
import { isHabitCompleted } from "@/lib/habit-utils"
import type { Habit, CompletionMatrix } from "@/lib/types"

interface HabitGridProps {
  habits: Habit[]
  daysInMonth: number
  firstDayOfMonth: number
  selectedYear: number
  selectedMonth: number
  completions: CompletionMatrix
  onToggleCompletion: (habitId: string, day: number) => void
  today: Date
}

export function HabitGrid({
  habits,
  daysInMonth,
  selectedYear,
  selectedMonth,
  completions,
  onToggleCompletion,
  today,
}: HabitGridProps) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const isClickable = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day)
    return isToday(date) || isYesterday(date)
  }

  const isFuture = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day)
    return isFutureDay(date)
  }

  return (
    <div className="min-w-max">
      <div className="flex gap-1 mb-1 h-7 items-end">
        {days.map((day) => {
          const dayOfWeek = getDayOfWeek(selectedYear, selectedMonth, day)
          return (
            <div key={`header-${day}`} className="w-6 flex flex-col items-center justify-end">
              <span className="text-xs text-muted-foreground leading-none">{day}</span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">{getDayLetter(dayOfWeek)}</span>
            </div>
          )
        })}
      </div>

      {habits.map((habit) => (
        <div key={habit.id} className="flex gap-1 h-6.5 mb-1 items-center">
          {days.map((day) => {
            const dateKey = `${selectedYear}-${selectedMonth}-${day}`
            const completed = isHabitCompleted(habit.id, dateKey, completions)
            const clickable = isClickable(day)
            const future = isFuture(day)

            return (
              <button
                key={`${habit.id}-${day}`}
                onClick={() => clickable && onToggleCompletion(habit.id, day)}
                disabled={!clickable}
                className={cn(
                  "w-6 h-6 rounded-sm transition-colors",
                  completed ? "bg-green-500" : future ? "bg-muted/30" : "bg-muted",
                  clickable && !completed && "hover:bg-muted-foreground/30 cursor-pointer",
                  clickable && completed && "hover:bg-green-400 cursor-pointer",
                  !clickable && "cursor-default",
                )}
                title={clickable ? `Toggle ${habit.name} for day ${day}` : future ? "Future day" : "Read-only"}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
