"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { HabitList } from "@/components/habit-list"
import { HabitGrid } from "@/components/habit-grid"
import { MonthlyProgress } from "@/components/monthly-progress"
import { DayClassificationChart } from "@/components/day-classification-chart"
import { AnalyticsCharts } from "@/components/analytics-charts"
import type { Habit, CompletionMatrix } from "@/lib/types"
import { getDaysInMonth, getFirstDayOfMonth, isToday, isYesterday, formatDate } from "@/lib/date-utils"
import {
  calculateStreak,
  getLastPerfectDay,
  calculateDisciplineScore,
  getDayClassification,
  getHabitsCompletedPerDay,
  getDailyDisciplineScores,
} from "@/lib/habit-utils"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DEFAULT_HABITS: Habit[] = [
  { id: "1", name: "Exercise", isCore: true },
  { id: "2", name: "Read 30 mins", isCore: true },
  { id: "3", name: "Meditate", isCore: false },
  { id: "4", name: "No junk food", isCore: true },
  { id: "5", name: "Journal", isCore: false },
]

export default function HabitTrackerDashboard() {
  const today = useMemo(() => new Date(), [])
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear] = useState(today.getFullYear())
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS)
  const [completions, setCompletions] = useState<CompletionMatrix>({})

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth)

  // Derived values
  const coreHabits = useMemo(() => habits.filter((h) => h.isCore), [habits])

  const dayClassifications = useMemo(() => {
    const classifications: Record<number, "perfect" | "average" | "bad"> = {}
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${selectedMonth}-${day}`
      classifications[day] = getDayClassification(dateKey, coreHabits, completions)
    }
    return classifications
  }, [daysInMonth, selectedYear, selectedMonth, coreHabits, completions])

  const currentStreak = useMemo(() => calculateStreak(today, coreHabits, completions), [today, coreHabits, completions])

  const lastPerfectDay = getLastPerfectDay(today, coreHabits, completions)

  const disciplineScore = calculateDisciplineScore(selectedYear, selectedMonth, today, coreHabits, completions)

  const dayStats = useMemo(() => {
    let perfect = 0,
      average = 0,
      bad = 0
    const elapsedDays =
      selectedYear === today.getFullYear() && selectedMonth === today.getMonth() ? today.getDate() : daysInMonth

    for (let day = 1; day <= elapsedDays; day++) {
      const classification = dayClassifications[day]
      if (classification === "perfect") perfect++
      else if (classification === "average") average++
      else bad++
    }
    return { perfect, average, bad }
  }, [dayClassifications, daysInMonth, selectedYear, selectedMonth, today])

  const habitsPerDay = useMemo(
    () => getHabitsCompletedPerDay(selectedYear, selectedMonth, daysInMonth, habits, completions),
    [selectedYear, selectedMonth, daysInMonth, habits, completions],
  )

  const dailyScores = getDailyDisciplineScores(selectedYear, selectedMonth, daysInMonth, today, coreHabits, completions)

  // Handlers
  const handleToggleCompletion = useCallback(
    (habitId: string, day: number) => {
      const date = new Date(selectedYear, selectedMonth, day)
      if (!isToday(date) && !isYesterday(date)) return

      const dateKey = `${selectedYear}-${selectedMonth}-${day}`
      setCompletions((prev) => {
        const key = `${habitId}-${dateKey}`
        const newCompletions = { ...prev }
        if (newCompletions[key]) {
          delete newCompletions[key]
        } else {
          newCompletions[key] = true
        }
        return newCompletions
      })
    },
    [selectedYear, selectedMonth],
  )

  const handleAddHabit = useCallback(() => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: "New Habit",
      isCore: false,
    }
    setHabits((prev) => [...prev, newHabit])
  }, [])

  const handleUpdateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))
  }, [])

  const handleDeleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }, [])

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto p-3 space-y-2">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="w-1/4 flex items-center justify-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Daily Dashboard</h1>
          </div>
          {/* Summary Metrics */}
          <DashboardHeader
            currentStreak={currentStreak}
            lastPerfectDay={lastPerfectDay ? formatDate(lastPerfectDay) : "N/A"}
            disciplineScore={disciplineScore}
            selectedMonth={MONTHS[selectedMonth]}
            selectedMonthIndex={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={MONTHS}
          />
        </div>

        {/* Main Grid Section */}
        <Card className="bg-card rounded-none border-border pt-5 pb-5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Daily Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Section: Habit tracking */}
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Left: Habit List */}
              <HabitList
                habits={habits}
                onAddHabit={handleAddHabit}
                onUpdateHabit={handleUpdateHabit}
                onDeleteHabit={handleDeleteHabit}
              />

              {/* Center: Habit Grid */}
              <div className="flex-1 overflow-x-auto">
                <HabitGrid
                  habits={habits}
                  daysInMonth={daysInMonth}
                  firstDayOfMonth={firstDayOfMonth}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  completions={completions}
                  onToggleCompletion={handleToggleCompletion}
                  today={today}
                />
              </div>

              {/* Right: Monthly Progress */}
              <div className="lg:w-44">
                <MonthlyProgress
                  habits={habits}
                  daysInMonth={daysInMonth}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  completions={completions}
                  today={today}
                />
              </div>
            </div>

            {/* Bottom Section: Analytics */}
            <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-border">
              {/* Left: Analytics Chart */}
              <div className="flex-1">
                {/* <h3 className="text-lg font-semibold mb-4">Analytics</h3> */}
                <AnalyticsCharts
                  habitsPerDay={habitsPerDay}
                  dailyScores={dailyScores}
                  daysInMonth={daysInMonth}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  today={today}
                />
              </div>

              {/* Right: Day Classification Chart */}
              <div className="lg:w-80">
                {/* <h3 className="text-lg font-semibold mb-4">Day Classification</h3> */}
                <DayClassificationChart stats={dayStats} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}