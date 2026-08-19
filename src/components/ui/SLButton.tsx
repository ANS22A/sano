'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// BUTTON COMPONENT
// ─────────────────────────────────────────────

export interface SLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  /** Loading state */
  loading?: boolean
  /** Icon-only mode */
  iconOnly?: boolean
  /** Render as anchor (for <a> elements) */
  as?: React.ElementType
  /** External href support */
  href?: string
}

const variantClasses: Record<NonNullable<SLButtonProps['variant']>, string> = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline:   'btn btn-outline',
  ghost:     'btn btn-ghost',
  accent:    'btn btn-accent',
}

const sizeClasses: Record<NonNullable<SLButtonProps['size']>, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export const SLButton = React.forwardRef<HTMLButtonElement, SLButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      as: Tag = 'button',
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.div
        whileHover={!isDisabled ? { y: -1 } : undefined}
        whileTap={!isDisabled ? { y: 0, scale: 0.99 } : undefined}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="inline-flex"
      >
        <Tag
          ref={ref}
          className={cn(
            variantClasses[variant],
            sizeClasses[size],
            iconOnly && 'btn-icon',
            className
          )}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading}
          {...props}
        >
          {loading && (
            <Loader2
              className="animate-spin shrink-0"
              size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
              aria-hidden="true"
            />
          )}
          {children}
        </Tag>
      </motion.div>
    )
  }
)

SLButton.displayName = 'SLButton'

// ─────────────────────────────────────────────
// ICON BUTTON
// ─────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  label: string  // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', label, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          'btn-icon',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

// ─────────────────────────────────────────────
// ARROW LINK — Editorial text link with arrow
// ─────────────────────────────────────────────

interface ArrowLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType
  href?: string
  dir?: 'ltr' | 'rtl'
}

export function ArrowLink({ as: Tag = 'button', dir, className, children, ...props }: ArrowLinkProps) {
  return (
    <Tag className={cn('link-arrow group', className)} dir={dir} {...props}>
      {children}
      <span
        className="arrow inline-block transition-transform duration-150 ease-smooth group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
        aria-hidden="true"
      >
        →
      </span>
    </Tag>
  )
}
