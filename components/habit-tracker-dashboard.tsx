"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { HabitList } from "@/components/habit-list"
import { HabitGrid } from "@/components/habit-grid"
import { MonthlyProgress } from "@/components/monthly-progress"
import { DayClassificationChart } from "@/components/day-classification-chart"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { useAuth } from "@/lib/auth-context"
import { Power } from "lucide-react"
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
import { getHabits, createHabit, updateHabit, deleteHabit, toggleCompletion, getCompletions } from "@/lib/actions"

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

export default function HabitTrackerDashboard() {
  const today = useMemo(() => new Date(), [])
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear] = useState(today.getFullYear())
  const { signOut } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<CompletionMatrix>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingHabit, setCreatingHabit] = useState(false)
  
  // Ref for debouncing habit updates
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load habits and completions from database
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Load habits and completions in parallel
        const [userHabits, completionsData] = await Promise.all([
          getHabits(),
          getCompletions()
        ])
        
        setHabits(userHabits)
        setCompletions(completionsData)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedYear, selectedMonth]) // Reload when month/year changes

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

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
    async (habitId: string, day: number) => {
      const date = new Date(selectedYear, selectedMonth, day)
      if (!isToday(date) && !isYesterday(date)) return

      const dateKey = `${selectedYear}-${selectedMonth}-${day}`
      const completionKey = `${habitId}-${dateKey}`
      
      // Optimistic update - update UI immediately
      const wasCompleted = !!completions[completionKey]
      setCompletions((prev) => {
        const newCompletions = { ...prev }
        if (wasCompleted) {
          delete newCompletions[completionKey]
        } else {
          newCompletions[completionKey] = true
        }
        return newCompletions
      })

      try {
        // Update database
        const success = await toggleCompletion(habitId, date)
        
        if (!success) {
          // Revert optimistic update on failure
          setCompletions((prev) => {
            const newCompletions = { ...prev }
            if (wasCompleted) {
              newCompletions[completionKey] = true
            } else {
              delete newCompletions[completionKey]
            }
            return newCompletions
          })
          setError('Failed to update habit completion. Please try again.')
        }
      } catch (err) {
        console.error('Failed to toggle completion:', err)
        // Revert optimistic update on error
        setCompletions((prev) => {
          const newCompletions = { ...prev }
          if (wasCompleted) {
            newCompletions[completionKey] = true
          } else {
            delete newCompletions[completionKey]
          }
          return newCompletions
        })
        setError('Failed to update habit completion. Please try again.')
      }
    },
    [selectedYear, selectedMonth, completions],
  )

  const handleAddHabit = useCallback(async () => {
    // Prevent multiple rapid clicks (debouncing)
    if (creatingHabit) return
    
    try {
      setCreatingHabit(true)
      
      // Optimistic update - add habit to UI immediately
      const tempId = `temp-${Date.now()}`
      const newHabit: Habit = {
        id: tempId,
        name: "New Habit",
        isCore: false,
      }
      setHabits((prev) => [...prev, newHabit])

      // Create habit in database
      const createdHabit = await createHabit("New Habit", false)

      if (createdHabit) {
        // Replace temporary habit with real habit from database
        setHabits((prev) => 
          prev.map(h => h.id === tempId ? createdHabit : h)
        )
      } else {
        throw new Error('Failed to create habit')
      }
    } catch (err) {
      console.error('Failed to create habit:', err)
      // Remove optimistic update on error
      setHabits((prev) => prev.filter(h => !h.id.startsWith('temp-')))
      setError('Failed to create habit. Please try again.')
    } finally {
      setCreatingHabit(false)
    }
  }, [creatingHabit])

  const handleUpdateHabit = useCallback((id: string, updates: Partial<Habit>, immediate: boolean = false) => {
    // Always update local state immediately for good UX
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Update database with debouncing or immediately
    const updateDatabase = async () => {
      try {
        const habit = habits.find(h => h.id === id)
        if (!habit) return

        const updatedHabit = { ...habit, ...updates }
        await updateHabit(id, {
          name: updatedHabit.name,
          isCore: updatedHabit.isCore
        })
      } catch (err) {
        console.error('Failed to update habit:', err)
        setError('Failed to update habit. Please try again.')
      }
    }

    if (immediate) {
      // Update immediately (for onBlur events)
      updateDatabase()
    } else {
      // Debounce for typing (wait 2 seconds after user stops typing)
      updateTimeoutRef.current = setTimeout(updateDatabase, 2000)
    }
  }, [habits])

  // Helper function for immediate updates (onBlur)
  const handleUpdateHabitImmediate = useCallback((id: string, updates: Partial<Habit>) => {
    handleUpdateHabit(id, updates, true)
  }, [handleUpdateHabit])

  const handleDeleteHabit = useCallback(async (id: string) => {
    // Store the habit for potential rollback
    const habitToDelete = habits.find(h => h.id === id)
    if (!habitToDelete) return

    // Store completions for potential rollback
    const habitCompletions = Object.entries(completions)
      .filter(([key]) => key.startsWith(`${id}-`))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    // Optimistic update - remove from UI immediately
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setCompletions((prev) => {
      const newCompletions = { ...prev }
      Object.keys(newCompletions).forEach(key => {
        if (key.startsWith(`${id}-`)) {
          delete newCompletions[key]
        }
      })
      return newCompletions
    })

    try {
      // Delete from database
      const success = await deleteHabit(id)
      
      if (!success) {
        // Restore habit and completions if delete failed
        setHabits((prev) => [...prev, habitToDelete])
        setCompletions((prev) => ({ ...prev, ...habitCompletions }))
        setError('Failed to delete habit. Please try again.')
      }
    } catch (err) {
      console.error('Failed to delete habit:', err)
      // Restore habit and completions on error
      setHabits((prev) => [...prev, habitToDelete])
      setCompletions((prev) => ({ ...prev, ...habitCompletions }))
      setError('Failed to delete habit. Please try again.')
    }
  }, [habits, completions])

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto p-3 space-y-2">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your habits...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Daily Dashboard</h1>
              </div>
              {/* Right Side - Metrics and Logout */}
              <div className="flex items-center gap-4">
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
                {/* Logout Button */}
                <Button
                  onClick={signOut}
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                >
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </div>

        {/* Main Grid Section */}
        <Card className="bg-background rounded-none border-border pt-5 pb-5">
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
                onUpdateHabitImmediate={handleUpdateHabitImmediate}
                onDeleteHabit={handleDeleteHabit}
                creatingHabit={creatingHabit}
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
          </>
        )}
      </div>
    </div>
  )
}