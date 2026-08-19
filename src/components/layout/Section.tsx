import * as React from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// SECTION — Vertical rhythm management
// ─────────────────────────────────────────────

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * standard  — py [60px → 120px]
   * large     — py [80px → 160px]
   * small     — py [40px → 64px]
   * none      — no padding
   */
  spacing?: 'standard' | 'large' | 'small' | 'none'
  /**
   * default    — background color
   * surface    — surface color
   * dark       — dark inverted
   * accent     — accent-subtle tint
   * transparent
   */
  background?: 'default' | 'surface' | 'dark' | 'accent' | 'transparent'
  as?: React.ElementType
}

const spacingClasses: Record<NonNullable<SectionProps['spacing']>, string> = {
  standard:    'py-[60px] md:py-[80px] lg:py-[120px]',
  large:       'py-[80px] md:py-[100px] lg:py-[160px]',
  small:       'py-[40px] md:py-[48px] lg:py-[64px]',
  none:        '',
}

const backgroundClasses: Record<NonNullable<SectionProps['background']>, string> = {
  default:     'bg-background',
  surface:     'bg-surface',
  dark:        'bg-foreground text-background',
  accent:      'bg-accent-subtle',
  transparent: 'bg-transparent',
}

export function Section({
  spacing = 'standard',
  background = 'default',
  as: Tag = 'section',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
