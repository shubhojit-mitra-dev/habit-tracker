"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { Habit } from "@/lib/types"

interface HabitListProps {
  habits: Habit[]
  onAddHabit: () => void
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void
  onDeleteHabit: (id: string) => void
}

export function HabitList({ habits, onAddHabit, onUpdateHabit, onDeleteHabit }: HabitListProps) {
  return (
    <div className="w-full lg:w-48 space-y-1 shrink-0">
      <div className="text-sm font-medium text-muted-foreground mb-3">Habits</div>

      {habits.map((habit) => (
        <div key={habit.id} className="flex items-center gap-2 h-6.5 mb-1 group">
          <Input
            value={habit.name}
            onChange={(e) => onUpdateHabit(habit.id, { name: e.target.value })}
            className="h-6 text-sm bg-muted border-0 focus-visible:ring-1"
          />
          <div className="flex items-center gap-1">
            <Switch
              id={`core-${habit.id}`}
              checked={habit.isCore}
              onCheckedChange={(checked) => onUpdateHabit(habit.id, { isCore: checked })}
              className="scale-75"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteHabit(habit.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
        onClick={onAddHabit}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Habit
      </Button>
    </div>
  )
}
