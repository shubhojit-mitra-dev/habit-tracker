"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Habit } from '@/lib/types'

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

// Convert database habit to client habit
function toClientHabit(habit: any): Habit {
  return {
    id: habit.id,
    name: habit.name,
    isCore: habit.is_core, // Map database is_core to client isCore
  }
}

// HABITS ACTIONS

export async function getHabits(): Promise<Habit[]> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching habits:', error)
      return []
    }
    
    return (data || []).map(toClientHabit)
  } catch (error) {
    console.error('Error in getHabits:', error)
    return []
  }
}

export async function createHabit(name: string, isCore: boolean = false): Promise<Habit | null> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: name.trim(),
        is_core: isCore,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating habit:', error)
      return null
    }
    
    revalidatePath('/')
    return toClientHabit(data)
  } catch (error) {
    console.error('Error in createHabit:', error)
    return null
  }
}

export async function updateHabit(id: string, updates: { name?: string; isCore?: boolean }): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()
    
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name.trim()
    if (updates.isCore !== undefined) updateData.is_core = updates.isCore
    
    const { error } = await supabase
      .from('habits')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error updating habit:', error)
      return false
    }
    
    revalidatePath('/')
    return true
  } catch (error) {
    console.error('Error in updateHabit:', error)
    return false
  }
}

export async function deleteHabit(id: string): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()
    
    // First delete all completions for this habit
    await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', id)
      .eq('user_id', user.id)
    
    // Then delete the habit
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting habit:', error)
      return false
    }
    
    revalidatePath('/')
    return true
  } catch (error) {
    console.error('Error in deleteHabit:', error)
    return false
  }
}

// COMPLETION ACTIONS

export async function getCompletions(): Promise<Record<string, boolean>> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()
    
    // Get completions from the current year
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const endOfYear = `${currentYear}-12-31`
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('habit_id, completed_date')
      .eq('user_id', user.id)
      .gte('completed_date', startOfYear)
      .lte('completed_date', endOfYear)
    
    if (error) {
      console.error('Error fetching completions:', error)
      return {}
    }
    
    // Convert to the format expected by the client
    const completions: Record<string, boolean> = {}
    
    for (const completion of data || []) {
      // Parse the date string directly instead of creating Date object to avoid timezone issues
      const dateStr = completion.completed_date // Already in YYYY-MM-DD format
      const [year, month, day] = dateStr.split('-').map(Number)
      const dateKey = `${year}-${month - 1}-${day}` // month - 1 because JS months are 0-based
      const key = `${completion.habit_id}-${dateKey}`
      completions[key] = true
    }
    
    return completions
  } catch (error) {
    console.error('Error in getCompletions:', error)
    return {}
  }
}

export async function toggleCompletion(habitId: string, date: Date): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()
    
    // Format date as YYYY-MM-DD using local timezone (not UTC)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const completedDate = `${year}-${month}-${day}`
    
    // Check if completion already exists
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('habit_id', habitId)
      .eq('completed_date', completedDate)
      .single()
    
    if (existing) {
      // Remove completion
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id)
      
      if (error) {
        console.error('Error removing completion:', error)
        return false
      }
    } else {
      // Add completion
      const { error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          completed_date: completedDate,
        })
      
      if (error) {
        console.error('Error adding completion:', error)
        return false
      }
    }
    
    revalidatePath('/')
    return true
  } catch (error) {
    console.error('Error in toggleCompletion:', error)
    return false
  }
}