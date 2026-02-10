"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2 } from "lucide-react"
import type { Habit } from "@/lib/types"

interface HabitListProps {
  habits: Habit[]
  onAddHabit: () => void
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void
  onUpdateHabitImmediate: (id: string, updates: Partial<Habit>) => void
  onDeleteHabit: (id: string) => void
  creatingHabit?: boolean
}

export function HabitList({ 
  habits, 
  onAddHabit, 
  onUpdateHabit, 
  onUpdateHabitImmediate, 
  onDeleteHabit, 
  creatingHabit = false 
}: HabitListProps) {
  return (
    <div className="w-full lg:w-52 space-y-1 shrink-0">
      <div className="text-sm font-medium text-muted-foreground mb-3">Habits</div>

      {habits.map((habit) => (
        <div key={habit.id} className="flex items-center gap-2 h-6.5 mb-1 group">
          <Input
            value={habit.name}
            onChange={(e) => onUpdateHabit(habit.id, { name: e.target.value })}
            onBlur={(e) => onUpdateHabitImmediate(habit.id, { name: e.target.value })}
            className="h-6 text-sm bg-muted border-0 focus-visible:ring-1"
            placeholder="Habit name..."
          />
          <div className="flex items-center gap-1">
            <Switch
              id={`core-${habit.id}`}
              checked={habit.isCore}
              onCheckedChange={(checked) => onUpdateHabitImmediate(habit.id, { isCore: checked })}
              className="scale-75"
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2 />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete habit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{habit.name}" and all its completion history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  variant="destructive"
                  onClick={() => onDeleteHabit(habit.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
        onClick={onAddHabit}
        disabled={creatingHabit}
      >
        {creatingHabit ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </>
        )}
      </Button>
    </div>
  )
}
