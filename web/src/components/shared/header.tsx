'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  rightContent?: React.ReactNode
  className?: string
  transparent?: boolean
}

export function Header({
  title,
  showBackButton = false,
  onBack,
  rightContent,
  className,
  transparent = false,
}: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className={cn('app-header', className)}>
      <div
        className={cn(
          'app-header-inner',
          transparent && 'bg-transparent border-transparent backdrop-blur-none'
        )}
      >
        {/* Left section - Back button or spacer */}
        <div className="w-10">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="Go back"
              className="h-10 w-10 rounded-full"
            >
              <BackIcon />
            </Button>
          )}
        </div>

        {/* Center section - Title */}
        {title && (
          <h1 className="flex-1 text-center text-heading font-bold text-foreground truncate px-2">
            {title}
          </h1>
        )}

        {/* Right section - Custom content or spacer */}
        <div className="w-10 flex justify-end">{rightContent}</div>
      </div>
    </header>
  )
}

// Large header with title for main pages
interface LargeHeaderProps {
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
  className?: string
}

export function LargeHeader({
  title,
  subtitle,
  rightContent,
  className,
}: LargeHeaderProps) {
  return (
    <header className={cn('px-4 pt-6 pb-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-display-sm font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-body text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {rightContent && <div className="ml-4">{rightContent}</div>}
      </div>
    </header>
  )
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
