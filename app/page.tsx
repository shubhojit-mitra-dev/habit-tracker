import HabitTrackerDashboard from "@/components/habit-tracker-dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <AuthGuard>
        <HabitTrackerDashboard />
      </AuthGuard>
    </main>
  )
}
