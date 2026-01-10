export interface Habit {
  id: string
  name: string
  isCore: boolean
}

export type CompletionMatrix = Record<string, boolean>
