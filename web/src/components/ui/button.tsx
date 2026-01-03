'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'tap-target',

          // Variant styles
          {
            // Primary - Bold, confident
            'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm':
              variant === 'primary',

            // Secondary - Subtle, supportive
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70':
              variant === 'secondary',

            // Ghost - Minimal, unobtrusive
            'bg-transparent text-foreground hover:bg-muted active:bg-muted/80':
              variant === 'ghost',

            // Danger - Warning, destructive
            'bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80':
              variant === 'danger',

            // Accent - Call to action, premium
            'bg-accent-gradient text-accent-foreground hover:opacity-90 active:opacity-80 shadow-glow':
              variant === 'accent',

            // Outline - Bordered, clean
            'border-2 border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80':
              variant === 'outline',
          },

          // Size styles
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-5 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
            'h-11 w-11 p-0': size === 'icon',
          },

          className
        )}
        disabled={isDisabled}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="opacity-0">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

function LoadingSpinner() {
  return (
    <svg
      className="absolute h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export { Button }
