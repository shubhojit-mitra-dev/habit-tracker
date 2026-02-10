"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/neon-button'
import Loader from '@/components/ui/loader'
import ProceduralGroundBackground from '@/components/ui/proceedural-ground-background'

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
    <main className="min-h-screen relative">
      <ProceduralGroundBackground />
      
      {/* Center Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 text-white">
            Build Better Habits
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Track your daily habits, build discipline, and achieve consistency with our minimal yet powerful habit tracking dashboard.
          </p>
          <Button 
            size="lg" 
            className="px-8 text-lg"
            onClick={() => router.push('/auth')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </main>
  )
}
