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
      'group relative flex flex-col bg-background border border-border-subtle shadow-subtle',
      'rounded-sm overflow-hidden transition-all duration-300',
      'hover:border-accent/40 hover:shadow-elevated hover:-translate-y-1'
    )}>
      {/* Image / Luxury Visual Banner */}
      <div className="h-52 relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-surface-lavender flex items-center justify-center">
        {pkg.image_url ? (
          <Image
            src={pkg.image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/90 p-4 text-center">
            <span className="text-3xl text-accent mb-1 animate-pulse">✦</span>
            <span className="font-display text-sm tracking-widest text-accent uppercase">{isAr ? 'باقة طقوس راقية' : 'Luxury Ritual'}</span>
            <span className="text-[11px] text-white/60 mt-1">{isAr ? 'عناية متكاملة في منزلك' : 'Complete Home Wellness'}</span>
          </div>
        )}

        {/* Guest Badge */}
        {pkg.max_guests > 1 && (
          <div className="absolute top-3 start-3 z-10 px-2.5 py-1 rounded-sm bg-primary/90 text-white text-[10px] tracking-wider uppercase font-medium border border-accent/30 backdrop-blur-sm">
            {isAr ? 'لشخصين' : 'For 2 Guests'}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Price badge */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {tagline && (
              <p className="text-accent text-xs tracking-widest uppercase font-medium mb-1">
                {tagline}
              </p>
            )}
            <h2 className="font-display text-xl text-foreground font-medium group-hover:text-primary transition-colors">{name}</h2>
          </div>
          <div className="shrink-0 text-end">
            <span className="text-2xl font-light text-foreground tabular-nums font-display">
              {pkg.price_sar}
            </span>
            <span className="text-xs text-muted-foreground ms-1">
              {isAr ? 'ريال' : 'SAR'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Included services list */}
        <div className="space-y-1.5 flex-1 bg-surface-muted/60 p-3.5 rounded-sm border border-border-subtle">
          <p className="text-[10px] text-accent font-semibold uppercase tracking-wider mb-2">
            {isAr ? 'الخدمات المشمولة في الباقة:' : 'Includes in package:'}
          </p>
          <ul className="space-y-1">
            {includedServices.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                <span className="text-accent text-[10px]" aria-hidden="true">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border-subtle pt-3">
          <span className="flex items-center gap-1">
            <span className="text-accent">◌</span>
            <span>{pkg.total_duration_minutes} {isAr ? 'دقيقة' : 'min'}</span>
          </span>
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
            'btn btn-md btn-primary',
            'w-full shadow-sm hover:shadow-luxury hover:scale-[1.01] transition-all'
          )}
        >
          {isAr ? 'احجزي الباقة الآن' : 'Book This Package'}
        </Link>
      </div>
    </article>
  )
}

