"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import Loader from '@/components/ui/loader'
import Squares from '@/components/Squares'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen relative bg-background">
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      </div>
    )
  }

  // Don't render auth form for authenticated users
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen relative bg-background">
      <div className="absolute inset-0">
        <Squares 
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#271E37"
          hoverFillColor="#222222"
        />
      </div>
      <div className="relative z-10">
        <AuthForm 
          mode={authMode} 
          onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')} 
        />
      </div>
    </div>
  )
}