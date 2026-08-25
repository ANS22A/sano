'use client'

import { cn } from '@/lib/utils/cn'

interface AdminBadgeProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | string
  label: string
  size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-warning-bg text-warning border-warning-border',
  confirmed: 'bg-success-bg text-success border-success-border',
  cancelled: 'bg-error-bg text-error border-error-border',
  completed: 'bg-info-bg text-info border-info-border',
  no_show:   'bg-muted text-muted-foreground border-border',
  active:    'bg-success-bg text-success border-success-border',
  inactive:  'bg-muted text-muted-foreground border-border',
}

export function AdminBadge({ status, label, size = 'md' }: AdminBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        style
      )}
    >
      {label}
    </span>
  )
}
