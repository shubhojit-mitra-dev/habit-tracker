export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, 1 = Monday, etc.
  return new Date(year, month, 1).getDay()
}

export function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month, day).getDay()
}

export function getDayLetter(dayOfWeek: number): string {
  const letters = ["S", "M", "T", "W", "T", "F", "S"]
  return letters[dayOfWeek]
}

export function isToday(date: Date): boolean {
  const today = new Date()
  // Normalize both dates to avoid any time component issues
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return todayNormalized.getTime() === dateNormalized.getTime()
}

export function isYesterday(date: Date): boolean {
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return yesterday.getTime() === dateNormalized.getTime()
}

export function isPastDay(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

export function isFutureDay(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate > today
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
