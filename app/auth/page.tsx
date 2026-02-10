"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Don't render auth form for authenticated users
  if (user) {
    return null
  }

  return (
    <AuthForm 
      mode={authMode} 
      onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')} 
    />
  )
}