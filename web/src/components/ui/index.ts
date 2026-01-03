// UI Components - BARM Design System

// Core components
export { Button } from './button'
export type { ButtonProps } from './button'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export type { CardProps } from './card'

export { Input, FloatingInput, Textarea } from './input'
export type { InputProps, FloatingInputProps, TextareaProps } from './input'

// Feedback components
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'

export { ToastProvider, useToast, toast } from './toast'

export { Progress, CircularProgress } from './progress'
export type { ProgressProps, CircularProgressProps } from './progress'

// Display components
export { Avatar, AvatarGroup } from './avatar'
export type { AvatarProps, AvatarGroupProps } from './avatar'

export { Badge, DotBadge, StatusBadge } from './badge'
export type { BadgeProps, DotBadgeProps, StatusBadgeProps } from './badge'
