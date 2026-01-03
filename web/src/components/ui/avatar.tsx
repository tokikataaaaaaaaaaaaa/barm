'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const sizePx = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { src, alt = '', fallback, size = 'md', status, className, ...props },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)

    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-14 w-14 text-lg',
      xl: 'h-20 w-20 text-xl',
    }

    const statusSizeClasses = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3.5 w-3.5',
      xl: 'h-5 w-5',
    }

    const statusColors = {
      online: 'bg-success',
      offline: 'bg-muted-foreground',
      away: 'bg-warning',
      busy: 'bg-danger',
    }

    // Generate fallback initials
    const getInitials = (name: string) => {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }

    const initials = fallback ? getInitials(fallback) : alt ? getInitials(alt) : '?'

    const showImage = src && !imageError

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex shrink-0', className)}
        {...props}
      >
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-full',
            'bg-muted text-muted-foreground font-semibold',
            'ring-2 ring-background',
            sizeClasses[size]
          )}
        >
          {showImage ? (
            <Image
              src={src}
              alt={alt}
              width={sizePx[size]}
              height={sizePx[size]}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
              statusSizeClasses[size],
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

// Avatar Group component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarProps['size']
  children: React.ReactNode
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 4, size = 'md', children, className, ...props }, ref) => {
    const avatars = React.Children.toArray(children)
    const visibleAvatars = avatars.slice(0, max)
    const remainingCount = avatars.length - max

    const overlapClasses = {
      xs: '-ml-1.5',
      sm: '-ml-2',
      md: '-ml-2.5',
      lg: '-ml-3.5',
      xl: '-ml-5',
    }

    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-base',
      xl: 'h-20 w-20 text-lg',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
      >
        {visibleAvatars.map((avatar, index) => (
          <div
            key={index}
            className={cn(index > 0 && overlapClasses[size])}
          >
            {React.isValidElement<AvatarProps>(avatar)
              ? React.cloneElement(avatar, { size })
              : avatar}
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className={cn(
              'flex items-center justify-center rounded-full',
              'bg-muted text-muted-foreground font-semibold',
              'ring-2 ring-background',
              overlapClasses[size],
              sizeClasses[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup }
