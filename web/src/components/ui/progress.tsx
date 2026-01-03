'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface ProgressProps {
  value: number
  max?: number
  variant?: 'default' | 'accent' | 'success'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      showLabel = false,
      label,
      animated = true,
      className,
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    const variantClasses = {
      default: 'bg-gradient-to-r from-primary to-primary/80',
      accent: 'bg-gradient-to-r from-accent-500 to-accent-600',
      success: 'bg-gradient-to-r from-success to-success-600',
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {(showLabel || label) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <span className="text-body-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {showLabel && (
              <span className="text-body-sm font-medium text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-muted',
            sizeClasses[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${Math.round(percentage)}%`}
        >
          <motion.div
            className={cn(
              'h-full rounded-full',
              variantClasses[variant],
              size === 'lg' && 'shadow-inner-glow'
            )}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: animated ? 0.5 : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
          />

          {/* Shimmer effect for active progress */}
          {animated && percentage > 0 && percentage < 100 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear',
              }}
            />
          )}
        </div>
      </div>
    )
  }
)
Progress.displayName = 'Progress'

// Circular progress component
export interface CircularProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  variant?: 'default' | 'accent' | 'success'
  showValue?: boolean
  className?: string
  children?: React.ReactNode
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      strokeWidth,
      variant = 'default',
      showValue = true,
      className,
      children,
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizes = {
      sm: 48,
      md: 64,
      lg: 96,
      xl: 128,
    }

    const defaultStrokeWidths = {
      sm: 4,
      md: 5,
      lg: 6,
      xl: 8,
    }

    const svgSize = sizes[size]
    const stroke = strokeWidth ?? defaultStrokeWidths[size]
    const radius = (svgSize - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    const variantColors = {
      default: 'stroke-primary',
      accent: 'stroke-accent-500',
      success: 'stroke-success',
    }

    return (
      <div className={cn('relative inline-flex', className)}>
        <svg
          ref={ref}
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="-rotate-90"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={stroke}
          />

          {/* Progress circle */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            className={variantColors[variant]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>

        {/* Center content */}
        {(showValue || children) && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children || (
              <span
                className={cn('font-bold text-foreground', {
                  'text-sm': size === 'sm',
                  'text-base': size === 'md',
                  'text-xl': size === 'lg',
                  'text-2xl': size === 'xl',
                })}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = 'CircularProgress'

export { Progress, CircularProgress }
