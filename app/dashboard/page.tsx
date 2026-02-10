import HabitTrackerDashboard from "@/components/habit-tracker-dashboard"
import { AuthGuard } from "@/components/auth-guard"
import { Geist_Mono } from "next/font/google"

const geistMono = Geist_Mono({ subsets: ["latin"] })

export default function DashboardPage() {
  return (
    <main className={`min-h-screen bg-background ${geistMono.className}`}>
      <AuthGuard>
        <HabitTrackerDashboard />
      </AuthGuard>
    </main>
  )
}