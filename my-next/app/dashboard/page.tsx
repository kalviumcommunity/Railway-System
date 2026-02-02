'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user) {
        // Redirect based on role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard')
            break
          case 'KITCHEN':
            router.push('/kitchen/dashboard')
            break
          case 'PANTRY':
            router.push('/pantry/dashboard')
            break
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
