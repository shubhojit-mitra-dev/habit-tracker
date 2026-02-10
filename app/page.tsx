"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, BarChart3, Calendar, Target } from 'lucide-react'
import Loader from '@/components/ui/loader'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    )
  }

  // Don't render landing page for authenticated users
  if (user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Build Better Habits
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your daily habits, build discipline, and achieve consistency with our minimal yet powerful habit tracking dashboard.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={() => router.push('/auth')}
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Simple Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Mark habits complete with a single click. Clean, intuitive interface.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Visualize your progress with charts and discipline scores.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2">Monthly View</h3>
              <p className="text-muted-foreground text-sm">
                Navigate through months and years to track long-term progress.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Core Habits</h3>
              <p className="text-muted-foreground text-sm">
                Focus on essential habits that drive your discipline score.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
