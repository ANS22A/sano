import * as React from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// CONTAINER — Responsive width management
// ─────────────────────────────────────────────

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * narrow   — max-w-[768px]
   * default  — max-w-[1280px]  ← standard
   * wide     — max-w-[1440px]
   */
  size?: 'narrow' | 'default' | 'wide'
  as?: React.ElementType
}

const sizeClasses: Record<NonNullable<ContainerProps['size']>, string> = {
  narrow:  'max-w-[768px]',
  default: 'max-w-[1280px]',
  wide:    'max-w-[1440px]',
}

export function Container({
  size = 'default',
  as: Tag = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'w-full mx-auto px-5 sm:px-8 lg:px-12 xl:px-16',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
