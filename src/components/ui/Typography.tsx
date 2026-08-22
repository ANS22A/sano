import * as React from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// HEADING — Display-level and section headings
// ─────────────────────────────────────────────

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Visual size level */
  level?: 'display-xl' | 'display' | 'h1' | 'h2' | 'h3' | 'h4'
  /** Semantic HTML element */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span'
  /** Italic variant (Cinzel looks beautiful in italic) */
  italic?: boolean
  balance?: boolean
}

const headingClasses: Record<NonNullable<HeadingProps['level']>, string> = {
  'display-xl': 'text-display-xl',
  'display':    'text-display',
  'h1':         'text-h1',
  'h2':         'text-h2',
  'h3':         'text-h3',
  'h4':         'text-h4',
}

export function Heading({
  level = 'h2',
  as,
  italic = false,
  balance = true,
  className,
  children,
  ...props
}: HeadingProps) {
  // Default semantic tag based on visual level
  const semanticTagMap: Record<string, string> = {
    'display-xl': 'h1',
    'display':    'h1',
    'h1':         'h1',
    'h2':         'h2',
    'h3':         'h3',
    'h4':         'h4',
  }

  const Tag = (as ?? semanticTagMap[level] ?? 'h2') as React.ElementType

  return (
    <Tag
      className={cn(
        headingClasses[level],
        italic && 'italic',
        balance && 'text-balance',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────
// TEXT — Body typography
// ─────────────────────────────────────────────

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'lg' | 'md' | 'sm'
  muted?: boolean
  as?: React.ElementType
  balance?: boolean
}

export function Text({
  size = 'md',
  muted = false,
  as: Tag = 'p',
  balance = false,
  className,
  children,
  ...props
}: TextProps) {
  const sizeClass = size === 'lg' ? 'text-body-lg' : size === 'sm' ? 'text-body-sm' : 'text-body'

  return (
    <Tag
      className={cn(
        sizeClass,
        muted && 'text-muted-foreground',
        balance && 'text-balance',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────
// DISPLAY — Hero-level text (very large)
// ─────────────────────────────────────────────

interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  xl?: boolean
  italic?: boolean
  as?: React.ElementType
}

export function Display({ xl = false, italic = false, as: Tag = 'h1', className, children, ...props }: DisplayProps) {
  return (
    <Tag
      className={cn(
        xl ? 'text-display-xl' : 'text-display',
        italic && 'italic',
        'text-balance',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────
// OVERLINE — Small uppercase category labels
// ─────────────────────────────────────────────

interface OverlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  withLine?: boolean
  centered?: boolean
  as?: React.ElementType
}

export function Overline({ withLine = false, centered = false, as: Tag = 'span', className, children, ...props }: OverlineProps) {
  return (
    <Tag
      className={cn(
        'text-overline block',
        withLine && 'flex items-center gap-3',
        centered && 'text-center justify-center',
        className
      )}
      {...props}
    >
      {withLine && <span className="block w-8 h-px bg-accent flex-shrink-0" aria-hidden="true" />}
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────
// LABEL — Form and UI labels
// ─────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function SLLabel({ required = false, className, children, ...props }: LabelProps) {
  return (
    <label className={cn('form-label', className)} {...props}>
      {children}
      {required && (
        <span className="text-error ms-1" aria-hidden="true">*</span>
      )}
    </label>
  )
}

// ─────────────────────────────────────────────
// CAPTION — Small secondary text
// ─────────────────────────────────────────────

interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: React.ElementType
}

export function Caption({ as: Tag = 'span', className, children, ...props }: CaptionProps) {
  return (
    <Tag className={cn('text-caption', className)} {...props}>
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────
// PRICE — Formatted price display
// ─────────────────────────────────────────────

interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number | string
  currency?: string
  period?: string
}

export function Price({ amount, currency = 'SAR', period, className, ...props }: PriceProps) {
  return (
    <span className={cn('text-price inline-flex items-baseline gap-1', className)} {...props}>
      <span className="text-overline text-muted-foreground">{currency}</span>
      <span>{amount}</span>
      {period && (
        <span className="text-body-sm text-muted-foreground">/ {period}</span>
      )}
    </span>
  )
}

// ─────────────────────────────────────────────
// SECTION HEADING GROUP — Overline + Heading + Text pattern
// ─────────────────────────────────────────────

interface SectionHeadingProps {
  overline?: string
  title: string
  subtitle?: string
  centered?: boolean
  titleLevel?: HeadingProps['level']
  titleAs?: HeadingProps['as']
  className?: string
}

export function SectionHeading({
  overline,
  title,
  subtitle,
  centered = false,
  titleLevel = 'h2',
  titleAs,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-12 lg:mb-16', centered && 'text-center', className)}>
      {overline && (
        <Overline
          withLine={!centered}
          centered={centered}
          className="mb-4"
        >
          {overline}
        </Overline>
      )}
      <Heading level={titleLevel} as={titleAs} className="mb-4">
        {title}
      </Heading>
      {subtitle && (
        <Text size="lg" muted className={cn('max-w-2xl', centered && 'mx-auto')}>
          {subtitle}
        </Text>
      )}
    </div>
  )
}
