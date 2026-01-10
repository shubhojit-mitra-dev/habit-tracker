import type { Habit, CompletionMatrix } from "./types"

export function isHabitCompleted(habitId: string, dateKey: string, completions: CompletionMatrix): boolean {
  return !!completions[`${habitId}-${dateKey}`]
}

export function getDayClassification(
  dateKey: string,
  coreHabits: Habit[],
  completions: CompletionMatrix,
): "perfect" | "average" | "bad" {
  if (coreHabits.length === 0) return "bad"

  const coreCompleted = coreHabits.filter((h) => isHabitCompleted(h.id, dateKey, completions)).length

  if (coreCompleted === coreHabits.length) return "perfect"
  if (coreCompleted > 0) return "average"
  return "bad"
}

export function calculateStreak(today: Date, coreHabits: Habit[], completions: CompletionMatrix): number {
  if (coreHabits.length === 0) return 0

  let streak = 0
  const checkDate = new Date(today)

  while (true) {
    const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
    const classification = getDayClassification(dateKey, coreHabits, completions)

    if (classification === "perfect") {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function getLastPerfectDay(today: Date, coreHabits: Habit[], completions: CompletionMatrix): Date | null {
  if (coreHabits.length === 0) return null

  const checkDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
    const classification = getDayClassification(dateKey, coreHabits, completions)

    if (classification === "perfect") {
      return new Date(checkDate)
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return null
}

export function calculateDisciplineScore(
  year: number,
  month: number,
  today: Date,
  coreHabits: Habit[],
  completions: CompletionMatrix,
): number {
  if (coreHabits.length === 0) return 0

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const daysToCheck = isCurrentMonth ? today.getDate() : new Date(year, month + 1, 0).getDate()

  let totalPossible = 0
  let totalCompleted = 0

  for (let day = 1; day <= daysToCheck; day++) {
    const dateKey = `${year}-${month}-${day}`
    for (const habit of coreHabits) {
      totalPossible++
      if (isHabitCompleted(habit.id, dateKey, completions)) {
        totalCompleted++
      }
    }
  }

  if (totalPossible === 0) return 0
  return Math.round((totalCompleted / totalPossible) * 100)
}

export function getHabitsCompletedPerDay(
  year: number,
  month: number,
  daysInMonth: number,
  habits: Habit[],
  completions: CompletionMatrix,
): number[] {
  const result: number[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`
    const completed = habits.filter((h) => isHabitCompleted(h.id, dateKey, completions)).length
    result.push(completed)
  }

  return result
}

export function getDailyDisciplineScores(
  year: number,
  month: number,
  daysInMonth: number,
  today: Date,
  coreHabits: Habit[],
  completions: CompletionMatrix,
): number[] {
  const result: number[] = []
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  for (let day = 1; day <= daysInMonth; day++) {
    if (isCurrentMonth && day > today.getDate()) {
      result.push(0)
      continue
    }

    if (coreHabits.length === 0) {
      result.push(0)
      continue
    }

    const dateKey = `${year}-${month}-${day}`
    const completed = coreHabits.filter((h) => isHabitCompleted(h.id, dateKey, completions)).length

    result.push(Math.round((completed / coreHabits.length) * 100))
  }

  return result
}
