# Habit Tracker Frontend Architecture & Backend Requirements

## Executive Summary

This document provides a comprehensive overview of the Habit Tracker frontend architecture, data requirements, and API specifications for backend development. The application follows a UI-first design approach where the frontend defines the data structures and interaction patterns that the backend must support.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts library
- **State Management**: React hooks (useState, useCallback, useMemo)
- **Theme**: Dark mode only

### Backend Requirements
- RESTful API architecture
- JSON data format
- Date handling in ISO format
- Real-time data consistency
- Optimistic update support

## Data Models & Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Habits Table
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_core BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### 3. Habit Completions Table
```sql
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, habit_id, completion_date)
);
```

### 4. Indexes for Performance
```sql
-- Completion queries by date range
CREATE INDEX idx_completions_user_date ON habit_completions(user_id, completion_date);
-- Habit lookups
CREATE INDEX idx_habits_user_active ON habits(user_id, deleted_at);
```

## Frontend Data Structures

### Core Types
```typescript
interface Habit {
  id: string              // UUID from backend
  name: string           // 1-255 characters, user input
  isCore: boolean        // Affects discipline score calculation
}

interface CompletionMatrix {
  [key: string]: boolean // Key format: "habitId-YYYY-M-D"
}

interface DayStats {
  perfect: number    // All core habits completed
  average: number    // Some core habits completed  
  bad: number       // No core habits completed
}
```

### Default Data
```typescript
const DEFAULT_HABITS: Habit[] = [
  { id: "1", name: "Exercise", isCore: true },
  { id: "2", name: "Read 30 mins", isCore: true },
  { id: "3", name: "Meditate", isCore: false },
  { id: "4", name: "No junk food", isCore: true },
  { id: "5", name: "Journal", isCore: false },
]
```

## State Management Architecture

### Primary Component State (habit-tracker-dashboard.tsx)

#### Core State Variables
```typescript
const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()) // 0-11
const [selectedYear] = useState<number>(today.getFullYear())               // Fixed for now
const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS)
const [completions, setCompletions] = useState<CompletionMatrix>({})
```

#### Derived State (Computed with useMemo)
```typescript
// Core habits (used for discipline calculations)
const coreHabits = useMemo(() => habits.filter(h => h.isCore), [habits])

// Day-by-day classifications for current month
const dayClassifications = useMemo(() => {
  const classifications: Record<number, "perfect" | "average" | "bad"> = {}
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${selectedYear}-${selectedMonth}-${day}`
    classifications[day] = getDayClassification(dateKey, coreHabits, completions)
  }
  return classifications
}, [daysInMonth, selectedYear, selectedMonth, coreHabits, completions])

// Current consecutive streak of perfect days
const currentStreak = useMemo(() => 
  calculateStreak(today, coreHabits, completions), 
  [today, coreHabits, completions]
)

// Statistics for donut chart
const dayStats = useMemo(() => {
  let perfect = 0, average = 0, bad = 0
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth
  
  for (let day = 1; day <= elapsedDays; day++) {
    const classification = dayClassifications[day]
    if (classification === "perfect") perfect++
    else if (classification === "average") average++
    else bad++
  }
  return { perfect, average, bad }
}, [dayClassifications, daysInMonth, selectedYear, selectedMonth, today])

// Data for analytics charts
const habitsPerDay = useMemo(() => 
  getHabitsCompletedPerDay(selectedYear, selectedMonth, daysInMonth, habits, completions),
  [selectedYear, selectedMonth, daysInMonth, habits, completions]
)
```

#### Non-Memoized Calculations
```typescript
// Calculated on every render (lightweight)
const lastPerfectDay = getLastPerfectDay(today, coreHabits, completions)
const disciplineScore = calculateDisciplineScore(selectedYear, selectedMonth, today, coreHabits, completions)
const dailyScores = getDailyDisciplineScores(selectedYear, selectedMonth, daysInMonth, today, coreHabits, completions)
```

## Business Logic & Calculations

### 1. Day Classification Logic
```typescript
function getDayClassification(dateKey: string, coreHabits: Habit[], completions: CompletionMatrix): "perfect" | "average" | "bad" {
  if (coreHabits.length === 0) return "bad"
  
  const coreCompleted = coreHabits.filter(h => 
    isHabitCompleted(h.id, dateKey, completions)
  ).length
  
  if (coreCompleted === coreHabits.length) return "perfect"
  if (coreCompleted > 0) return "average"
  return "bad"
}
```

### 2. Streak Calculation
```typescript
function calculateStreak(today: Date, coreHabits: Habit[], completions: CompletionMatrix): number {
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
```

### 3. Discipline Score Calculation
```typescript
function calculateDisciplineScore(year: number, month: number, today: Date, coreHabits: Habit[], completions: CompletionMatrix): number {
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
  
  return totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100)
}
```

### 4. Date Key Format
All completion tracking uses the format: `YYYY-M-D` (note: month is 0-indexed)
- Example: January 15, 2024 = `"2024-0-15"`
- Example: December 31, 2024 = `"2024-11-31"`

### 5. Completion Matrix Key Format
Completions are stored with the format: `habitId-dateKey`
- Example: `"abc123-2024-0-15"` = habit abc123 completed on January 15, 2024

## User Interaction Patterns

### 1. Habit Completion Toggle
```typescript
const handleToggleCompletion = useCallback((habitId: string, day: number) => {
  const date = new Date(selectedYear, selectedMonth, day)
  
  // Restriction: Only today and yesterday can be modified
  if (!isToday(date) && !isYesterday(date)) return
  
  const dateKey = `${selectedYear}-${selectedMonth}-${day}`
  setCompletions(prev => {
    const key = `${habitId}-${dateKey}`
    const newCompletions = { ...prev }
    
    if (newCompletions[key]) {
      delete newCompletions[key]  // Mark as incomplete
    } else {
      newCompletions[key] = true  // Mark as complete
    }
    
    return newCompletions
  })
}, [selectedYear, selectedMonth])
```

**Backend Impact**: 
- POST/DELETE to `/api/completions`
- Optimistic updates require rollback capability
- Date validation on server side

### 2. Habit Management
```typescript
const handleAddHabit = useCallback(() => {
  const newHabit: Habit = {
    id: Date.now().toString(), // Temporary ID until backend responds
    name: "New Habit",
    isCore: false,
  }
  setHabits(prev => [...prev, newHabit])
}, [])

const handleUpdateHabit = useCallback((id: string, updates: Partial<Habit>) => {
  setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h))
}, [])

const handleDeleteHabit = useCallback((id: string) => {
  setHabits(prev => prev.filter(h => h.id !== id))
}, [])
```

**Backend Impact**:
- Need temporary ID handling for optimistic updates
- Cascade deletion of completions when habit is deleted
- Real-time ID replacement after creation

### 3. Month Navigation
```typescript
const handleMonthChange = (monthIndex: number) => {
  setSelectedMonth(monthIndex)
  // This triggers:
  // 1. New completion data fetch
  // 2. Analytics recalculation
  // 3. Chart re-rendering
}
```

## Component Architecture & Data Flow

### 1. Main Container (habit-tracker-dashboard.tsx)
**Responsibilities**:
- Central state management
- API coordination
- Date calculations
- Event handling

**Data Dependencies**:
- Habits list
- Completions matrix for selected month
- Current date context

### 2. Dashboard Header (dashboard-header.tsx)
**Props**:
```typescript
interface DashboardHeaderProps {
  currentStreak: number        // From calculateStreak()
  lastPerfectDay: string      // From getLastPerfectDay() formatted
  disciplineScore: number     // From calculateDisciplineScore()
  selectedMonth: string       // MONTHS[selectedMonthIndex]
  selectedMonthIndex: number  // 0-11
  onMonthChange: (monthIndex: number) => void
  availableMonths: string[]   // Static MONTHS array
}
```

### 3. Habit Grid (habit-grid.tsx)
**Props**:
```typescript
interface HabitGridProps {
  habits: Habit[]
  daysInMonth: number         // From getDaysInMonth()
  firstDayOfMonth: number     // From getFirstDayOfMonth()
  selectedYear: number
  selectedMonth: number
  completions: CompletionMatrix
  onToggleCompletion: (habitId: string, day: number) => void
  today: Date
}
```

**Key Features**:
- 31-column grid layout
- Interactive checkboxes (only today/yesterday)
- Visual states: completed, incomplete, future, read-only
- Hover effects and tooltips

### 4. Monthly Progress (monthly-progress.tsx)
**Calculation Logic**:
```typescript
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
```

### 5. Analytics Charts (analytics-charts.tsx)
**Data Format**:
```typescript
const data = Array.from({ length: daysInMonth }, (_, i) => ({
  day: i + 1,
  habits: i < elapsedDays ? habitsPerDay[i] : null,
  score: i < elapsedDays ? dailyScores[i] : null,
}))
```

**Chart Configuration**:
- Dual Y-axis (habits count + percentage score)
- Area charts with gradients
- Null data handling for future dates
- Responsive design

### 6. Day Classification Chart (day-classification-chart.tsx)
**Data Structure**:
```typescript
const data = [
  { name: "Perfect", value: stats.perfect, color: "hsl(142, 71%, 45%)" },
  { name: "Average", value: stats.average, color: "hsl(48, 96%, 53%)" },
  { name: "Bad", value: stats.bad, color: "hsl(0, 84%, 60%)" },
].filter(d => d.value > 0)
```

## API Requirements & Endpoints

### 1. Authentication (Assumed)
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### 2. Habits Management
```
GET    /api/habits
POST   /api/habits
PUT    /api/habits/:id
DELETE /api/habits/:id
```

#### GET /api/habits
**Response**:
```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Exercise",
      "isCore": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/habits
**Request**:
```json
{
  "name": "New Habit",
  "isCore": false
}
```
**Response**:
```json
{
  "habit": {
    "id": "new-uuid",
    "name": "New Habit",
    "isCore": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Completions Management
```
GET    /api/completions?year=2024&month=0
POST   /api/completions
DELETE /api/completions
```

#### GET /api/completions
**Query Parameters**:
- `year`: number (required)
- `month`: number 0-11 (required)

**Response**:
```json
{
  "completions": [
    {
      "habitId": "uuid",
      "date": "2024-01-15",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/completions
**Request**:
```json
{
  "habitId": "uuid",
  "date": "2024-01-15"
}
```

#### DELETE /api/completions
**Request**:
```json
{
  "habitId": "uuid",
  "date": "2024-01-15"
}
```

### 4. Analytics Endpoint
```
GET /api/analytics?year=2024&month=0
```

**Response**:
```json
{
  "currentStreak": 5,
  "lastPerfectDay": "2024-01-10",
  "disciplineScore": 85,
  "monthStats": {
    "perfect": 8,
    "average": 5,
    "bad": 2
  },
  "dailyData": [
    {
      "day": 1,
      "habitsCompleted": 4,
      "disciplineScore": 80
    }
  ]
}
```

## Data Validation Rules

### Frontend Validation
```typescript
// Habit name validation
const isValidHabitName = (name: string) => 
  name.trim().length >= 1 && name.trim().length <= 50

// Date modification validation  
const canModifyDate = (date: Date) => 
  isToday(date) || isYesterday(date)

// Month validation
const isValidMonth = (month: number) => 
  month >= 0 && month <= 11
```

### Backend Validation Requirements
- Habit names: 1-50 characters, no HTML/script tags
- Completion dates: Only today and yesterday for modifications
- User ownership: All operations scoped to authenticated user
- Duplicate prevention: One completion per habit per date
- Cascade handling: Delete completions when habit is deleted

## Performance Optimization

### Frontend Optimizations
```typescript
// Expensive calculations are memoized
const dayClassifications = useMemo(() => {
  // Heavy computation only runs when dependencies change
}, [daysInMonth, selectedYear, selectedMonth, coreHabits, completions])

// Event handlers are cached
const handleToggleCompletion = useCallback((habitId, day) => {
  // Function identity stable across re-renders
}, [selectedYear, selectedMonth])
```

### Backend Performance Requirements
- Index on `(user_id, completion_date)` for monthly queries
- Index on `(user_id, habit_id, completion_date)` for specific lookups
- Batch operations for multiple completions
- Caching for analytics calculations
- Pagination for large datasets (future requirement)

## Error Handling Strategy

### Frontend Error Patterns
```typescript
// Optimistic updates with rollback
const [optimisticState, setOptimisticState] = useState(serverState)

const handleAction = async () => {
  const previousState = optimisticState
  setOptimisticState(newState) // Optimistic update
  
  try {
    await apiCall()
  } catch (error) {
    setOptimisticState(previousState) // Rollback
    showErrorToast(error.message)
  }
}
```

### Backend Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Habit name cannot be empty",
    "field": "name"
  }
}
```

### Expected Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource doesn't exist
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: User doesn't own resource
- `CONFLICT`: Duplicate completion attempt
- `RATE_LIMITED`: Too many requests

## Real-time Requirements

### Data Consistency
- Completion toggles should reflect immediately
- Month changes should fetch fresh data
- Habit modifications should update all dependent calculations
- Concurrent user sessions should stay synchronized (future requirement)

### Caching Strategy
- Completion data cached by month
- Habits list cached until modification
- Analytics calculations cached with invalidation
- Client-side cache invalidation on state changes

## Future Considerations

### Scalability Requirements
- Multi-year data handling
- Habit history and archiving
- Export/import functionality
- Sharing and social features
- Mobile app data synchronization

### Database Scaling
- Partition completions table by date
- Implement soft deletes for habits
- Add audit logging for data changes
- Consider read replicas for analytics queries

### API Versioning
- Plan for backward compatibility
- Version headers for API evolution
- Deprecation notices for old endpoints
- Migration paths for data structure changes

This document provides the complete specification for backend development to support the existing frontend architecture without requiring deep UI knowledge.