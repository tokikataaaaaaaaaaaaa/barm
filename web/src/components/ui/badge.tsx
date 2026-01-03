'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', pulse = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors',

          // Variant styles
          {
            'bg-primary text-primary-foreground': variant === 'default',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
            'bg-success/15 text-success': variant === 'success',
            'bg-warning/15 text-warning': variant === 'warning',
            'bg-danger/15 text-danger': variant === 'danger',
            'bg-accent/15 text-accent-600 dark:text-accent-400': variant === 'accent',
            'border border-border bg-transparent text-foreground': variant === 'outline',
          },

          // Size styles
          {
            'h-5 px-2 text-xs': size === 'sm',
            'h-6 px-2.5 text-xs': size === 'md',
            'h-7 px-3 text-sm': size === 'lg',
          },

          // Pulse animation
          pulse && 'badge-pulse',

          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

// Dot badge for notifications
export interface DotBadgeProps {
  show?: boolean
  count?: number
  max?: number
  variant?: 'default' | 'danger' | 'success' | 'accent'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  children: React.ReactNode
  className?: string
}

function DotBadge({
  show = true,
  count,
  max = 99,
  variant = 'danger',
  position = 'top-right',
  children,
  className,
}: DotBadgeProps) {
  if (!show && !count) return <>{children}</>

  const displayCount = count ? (count > max ? `${max}+` : count.toString()) : null

  const variantClasses = {
    default: 'bg-primary',
    danger: 'bg-danger',
    success: 'bg-success',
    accent: 'bg-accent-500',
  }

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      {children}
      <span
        className={cn(
          'absolute flex items-center justify-center rounded-full ring-2 ring-background',
          variantClasses[variant],
          positionClasses[position],
          displayCount
            ? 'min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white'
            : 'h-2.5 w-2.5'
        )}
        aria-label={displayCount ? `${displayCount} notifications` : 'New notification'}
      >
        {displayCount}
      </span>
    </div>
  )
}

// Status badge with icon
export interface StatusBadgeProps extends BadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const },
    inactive: { label: 'Inactive', variant: 'secondary' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    failed: { label: 'Failed', variant: 'danger' as const },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn('gap-1', className)}
      {...props}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', {
          'bg-success': config.variant === 'success',
          'bg-warning': config.variant === 'warning',
          'bg-danger': config.variant === 'danger',
          'bg-muted-foreground': config.variant === 'secondary',
        })}
      />
      {config.label}
    </Badge>
  )
}

export { Badge, DotBadge, StatusBadge }
