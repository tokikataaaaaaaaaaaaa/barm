'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { FullPageSpinner } from '@/components/shared/loading-spinner'
import { BottomNav } from '@/components/shared/bottom-nav'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasDisplayName } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (!hasDisplayName) {
        router.replace('/nickname')
      }
    }
  }, [isLoading, isAuthenticated, hasDisplayName, router])

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated || !hasDisplayName) {
    return <FullPageSpinner />
  }

  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
