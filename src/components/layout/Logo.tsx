import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Link } from '@/i18n/navigation'

// ─────────────────────────────────────────────
// LOGO COMPONENT
//
// Text-based SANO LUNA logotype.
// Architecture supports future image swap — just replace
// the inner <LogoMark> with an <Image> component.
//
// Variants:
//   auto  — foreground/background aware (CSS vars)
//   dark  — always dark text (for light backgrounds)
//   light — always light text (for dark/image backgrounds)
// ─────────────────────────────────────────────

interface LogoProps {
  variant?: 'auto' | 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  className?: string
  /** If true, renders as a plain div instead of a link */
  asDiv?: boolean
  /** Optional click handler (e.g. to close mobile menu) */
  onClick?: () => void
}

const sizeClasses = {
  sm: 'text-[13px] tracking-[0.2em]',
  md: 'text-[15px] tracking-[0.22em]',
  lg: 'text-[18px] tracking-[0.24em]',
}

const variantClasses = {
  auto:  'text-foreground',
  dark:  'text-foreground',
  light: 'text-white',
}

/**
 * The SANO LUNA logotype mark.
 * Isolated so it can be swapped for an <Image> later.
 */
function LogoMark({
  variant = 'auto',
  size = 'md',
}: Pick<LogoProps, 'variant' | 'size'>) {
  return (
    <span
      className={cn(
        'font-sans font-medium uppercase select-none',
        sizeClasses[size],
        variantClasses[variant],
        // Dot separator between SANO and LUNA
        'flex items-center gap-[0.4em]'
      )}
      aria-label="SANO LUNA"
    >
      <span>SANO</span>
      <span
        className={cn(
          'w-[3px] h-[3px] rounded-full flex-shrink-0',
          variant === 'light'
            ? 'bg-white/70'
            : variant === 'dark'
            ? 'bg-accent'
            : 'bg-accent'
        )}
        aria-hidden="true"
      />
      <span>LUNA</span>
    </span>
  )
}

export function Logo({
  variant = 'auto',
  size = 'md',
  className,
  asDiv = false,
  onClick,
}: LogoProps) {
  if (asDiv) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <LogoMark variant={variant} size={size} />
      </div>
    )
  }

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        'inline-flex items-center focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'rounded-sm',
        className
      )}
      aria-label="SANO LUNA — Home"
    >
      <LogoMark variant={variant} size={size} />
    </Link>
  )
}

