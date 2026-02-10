"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AuthForm } from './auth-form'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')} 
      />
    )
  }

  return <>{children}</>
}