'use client'

import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Package } from '@/data/types'

interface PackageCardProps {
  pkg: Package
  locale: string
}

export function PackageCard({ pkg, locale }: PackageCardProps) {
  const isAr = locale === 'ar'
  const name = isAr ? pkg.name_ar : pkg.name_en
  const tagline = isAr ? (pkg.tagline_ar ?? '') : (pkg.tagline_en ?? '')
  const description = isAr ? pkg.description_ar : pkg.description_en
  const includedServices = isAr ? pkg.included_services_ar : pkg.included_services_en

  return (
    <article className={cn(
      'group relative flex flex-col bg-white border border-[var(--border-subtle)]',
      'rounded-sm overflow-hidden hover:shadow-md transition-shadow duration-300'
    )}>
      {/* Image */}
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-surface to-accent flex items-center justify-center">
        {pkg.image_url ? (
          <Image
            src={pkg.image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-4xl opacity-30">✦</span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Price badge */}
        <div className={cn('flex items-start justify-between gap-4', isAr && 'flex-row-reverse')}>
          <div>
            {tagline && (
              <p className="text-primary text-xs tracking-widest uppercase mb-1">
                {tagline}
              </p>
            )}
            <h2 className="font-serif text-xl text-foreground">{name}</h2>
          </div>
          <div className="shrink-0 text-end">
            <span className="text-lg font-semibold text-foreground">
              {pkg.price_sar}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ms-1">
              {isAr ? 'ريال' : 'SAR'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[var(--color-text-muted)] text-sm leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Included services list */}
        <ul className="space-y-1 flex-1">
          {includedServices.map((item, i) => (
            <li key={i} className={cn(
              'flex items-center gap-2 text-sm text-foreground',
              isAr && 'flex-row-reverse'
            )}>
              <span className="text-border text-xs">✦</span>
              {item}
            </li>
          ))}
        </ul>

        {/* Meta */}
        <div className={cn(
          'flex items-center gap-4 text-xs text-[var(--color-text-muted)] border-t border-[var(--border-subtle)] pt-4',
          isAr && 'flex-row-reverse'
        )}>
          <span>{pkg.total_duration_minutes} {isAr ? 'دقيقة' : 'min'}</span>
          {pkg.max_guests > 1 && (
            <span>
              {isAr ? `${pkg.max_guests} ضيوف` : `Up to ${pkg.max_guests} guests`}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/booking?package=${pkg.slug}`}
          className={cn(
            'mt-2 inline-flex items-center justify-center gap-2',
            'bg-foreground text-white text-sm tracking-wide',
            'px-6 py-3 rounded-sm',
            'hover:bg-foreground transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-sand-700)] focus:ring-offset-2'
          )}
        >
          {isAr ? 'احجزي الآن' : 'Book Now'}
        </Link>
      </div>
    </article>
  )
}

