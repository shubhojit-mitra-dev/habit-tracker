import HabitTrackerDashboard from "@/components/habit-tracker-dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <AuthGuard>
        <HabitTrackerDashboard />
      </AuthGuard>
    </main>
  )
}