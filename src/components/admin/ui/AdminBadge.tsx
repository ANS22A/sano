'use client'

import { cn } from '@/lib/utils/cn'

interface AdminBadgeProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | string
  label: string
  size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-sky-50 text-sky-700 border-sky-200',
  no_show:   'bg-slate-100 text-slate-600 border-slate-200',
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive:  'bg-slate-100 text-slate-500 border-slate-200',
}

export function AdminBadge({ status, label, size = 'md' }: AdminBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
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
