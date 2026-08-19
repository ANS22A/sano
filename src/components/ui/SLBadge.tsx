import * as React from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// BADGE COMPONENT
// ─────────────────────────────────────────────

interface SLBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'featured'
  dot?: boolean
}

const variantClasses: Record<NonNullable<SLBadgeProps['variant']>, string> = {
  default:  'badge badge-default',
  primary:  'badge badge-primary',
  accent:   'badge badge-accent',
  success:  'badge badge-success',
  warning:  'badge badge-warning',
  error:    'badge badge-error',
  featured: 'badge badge-featured',
}

export function SLBadge({ variant = 'default', dot = false, className, children, ...props }: SLBadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
