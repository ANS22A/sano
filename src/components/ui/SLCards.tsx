import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// SERVICE CARD
// ─────────────────────────────────────────────

interface ServiceCardProps {
  title: string
  description?: string
  price?: number
  currency?: string
  duration?: number
  imageUrl?: string
  badge?: string
  href?: string
  className?: string
  onClick?: () => void
}

export function ServiceCard({
  title,
  description,
  price,
  currency = 'SAR',
  duration,
  imageUrl,
  badge,
  href,
  className,
  onClick,
}: ServiceCardProps) {
  const Wrapper = href ? 'a' : onClick ? 'button' : 'div'

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={cn('card-service block group w-full text-start', className)}
    >
      {/* Image */}
      {imageUrl && (
        <div className="aspect-[4/3] overflow-hidden relative bg-surface-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover gallery-img transition-transform duration-500 ease-luxury group-hover:scale-[1.04]"
          />
          {badge && (
            <span className="badge badge-accent absolute top-3 start-3 z-10">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-h4 mb-2 group-hover:text-primary transition-colors duration-150">
          {title}
        </h3>
        {description && (
          <p className="text-body-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          {price !== undefined && (
            <span className="text-price">
              <span className="text-overline text-muted-foreground me-1">{currency}</span>
              {price.toLocaleString()}
            </span>
          )}
          {duration && (
            <span className="text-caption text-muted-foreground">
              {duration} min
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

// ─────────────────────────────────────────────
// TESTIMONIAL CARD
// ─────────────────────────────────────────────

interface TestimonialCardProps {
  name: string
  review: string
  rating?: number
  className?: string
}

export function TestimonialCard({ name, review, rating = 5, className }: TestimonialCardProps) {
  return (
    <div className={cn('card-testimonial', className)}>
      {/* Stars */}
      {rating > 0 && (
        <div className="flex gap-0.5 mb-4" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'text-sm',
                i < rating ? 'text-accent' : 'text-border'
              )}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Opening quote mark — brand signature */}
      <div className="text-display text-accent/30 leading-none mb-2 font-display" aria-hidden="true">
        &ldquo;
      </div>

      <p className="text-body mb-6 text-foreground leading-relaxed">
        {review}
      </p>

      <div className="flex items-center gap-3">
        <div className="w-8 h-px bg-accent flex-shrink-0" aria-hidden="true" />
        <span className="text-label text-muted-foreground">{name}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// TEAM CARD
// ─────────────────────────────────────────────

interface TeamCardProps {
  name: string
  role: string
  photoUrl?: string
  className?: string
}

export function TeamCard({ name, role, photoUrl, className }: TeamCardProps) {
  return (
    <div className={cn('card-team group', className)}>
      {/* Photo */}
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-surface-muted mb-4 img-reveal-mask">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover object-top transition-transform duration-500 ease-luxury group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-muted flex items-center justify-center">
            <span className="text-display text-muted-foreground/30 font-display">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-h4 mb-1">{name}</h3>
      <p className="text-overline">{role}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// FEATURE CARD — Editorial divider style
// ─────────────────────────────────────────────

interface FeatureCardProps {
  number?: string | number
  title: string
  description: string
  className?: string
}

export function FeatureCard({ number, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn('card-feature', className)}>
      {number && (
        <span className="text-overline text-accent mb-3 block">
          {String(number).padStart(2, '0')}
        </span>
      )}
      <h3 className="text-h3 mb-3">{title}</h3>
      <p className="text-body text-muted-foreground">{description}</p>
    </div>
  )
}
