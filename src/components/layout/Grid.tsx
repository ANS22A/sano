import * as React from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// GRID — Responsive 12/8/4 column grid
// ─────────────────────────────────────────────

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns on desktop (4-12). Default: 12 */
  cols?: 2 | 3 | 4 | 5 | 6 | 12
  /** Gap between columns */
  gap?: 'sm' | 'default' | 'lg' | 'xl'
}

const colClasses: Record<NonNullable<GridProps['cols']>, string> = {
  2:  'grid-cols-1 sm:grid-cols-2',
  3:  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4:  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5:  'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6:  'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
}

const gapClasses: Record<NonNullable<GridProps['gap']>, string> = {
  sm:      'gap-4',
  default: 'gap-6',
  lg:      'gap-8',
  xl:      'gap-12',
}

export function Grid({
  cols = 3,
  gap = 'default',
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn('grid', colClasses[cols], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// SPLIT — 60/40 or 40/60 editorial split
// ─────────────────────────────────────────────

interface SplitProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of dominant side */
  dominant?: 'start' | 'end'
  /** Collapse direction on mobile */
  mobileOrder?: 'normal' | 'reverse'
  gap?: 'default' | 'lg' | 'xl'
}

export function Split({
  dominant = 'start',
  mobileOrder = 'normal',
  gap = 'lg',
  className,
  children,
  ...props
}: SplitProps) {
  const gapClass = gap === 'xl' ? 'gap-16 lg:gap-24' : gap === 'lg' ? 'gap-10 lg:gap-16' : 'gap-8 lg:gap-12'

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-[5fr_4fr] items-center',
        dominant === 'end' && 'lg:grid-cols-[4fr_5fr]',
        mobileOrder === 'reverse' && '[&>*:first-child]:order-2 lg:[&>*:first-child]:order-none',
        gapClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
