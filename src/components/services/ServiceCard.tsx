'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import type { Service, ServiceCategory } from '@/data/types'

interface ServiceCardProps {
  service: Service
  category?: ServiceCategory
  index?: number
}

export function ServiceCard({ service, category, index = 0 }: ServiceCardProps) {
  const t = useTranslations('services.card')
  const locale = useLocale()
  const isAr = locale === 'ar'

  const name = isAr ? service.name_ar : service.name_en
  const shortDesc = isAr ? service.short_description_ar : service.short_description_en
  const catName = category ? (isAr ? category.name_ar : category.name_en) : ''

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-sm',
        'border border-[var(--border-subtle)] bg-background',
        'transition-all duration-300',
        'hover:border-[var(--color-sand-400)]',
        'hover:shadow-[0_12px_40px_rgba(26,23,20,0.09)]'
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative h-52 flex-shrink-0 overflow-hidden',
          'bg-gradient-to-br',
          index % 4 === 0 && 'from-[var(--color-sand-100)] to-[var(--color-sand-200)]',
          index % 4 === 1 && 'from-[var(--color-sand-200)] to-[var(--color-sand-300)]',
          index % 4 === 2 && 'from-[var(--color-sand-100)] to-[var(--color-sand-300)]',
          index % 4 === 3 && 'from-[var(--color-surface-warm)] to-[var(--color-sand-200)]',
        )}
        aria-hidden="true"
      >
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-5xl text-[var(--color-sand-600)] font-display font-light">✦</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 start-3 flex gap-1.5 z-10">
          {service.is_popular && (
            <span className={cn(
              'px-2.5 py-1 rounded-sm text-[10px] tracking-[0.12em] uppercase font-medium',
              'bg-foreground/90 text-background backdrop-blur-[4px]'
            )}>
              {t('popular')}
            </span>
          )}
          {service.is_featured && !service.is_popular && (
            <span className={cn(
              'px-2.5 py-1 rounded-sm text-[10px] tracking-[0.12em] uppercase font-medium',
              'bg-background/90 text-foreground backdrop-blur-[4px]'
            )}>
              {t('featured')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        {catName && (
          <p className="text-[10px] tracking-[0.18em] uppercase text-[var(--color-text-muted)] mb-2">
            {catName}
          </p>
        )}

        {/* Name */}
        <h3 className={cn(
          'font-display text-lg font-light text-foreground leading-snug mb-2',
          'group-hover:text-[var(--color-accent)] transition-colors duration-200'
        )}>
          {name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 flex-1 line-clamp-2">
          {shortDesc}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          {/* Price & duration */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-foreground tabular-nums">
              {service.price_sar} {t('currency')}
            </span>
            <span className="text-[var(--border)] text-xs" aria-hidden="true">·</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {service.duration_minutes} {t('duration')}
            </span>
          </div>

          {/* CTA */}
          <Link
            href={`/services/${service.slug}`}
            className={cn(
              'text-xs font-medium',
              'text-[var(--color-accent)] hover:text-foreground',
              'transition-colors duration-200',
              'flex items-center gap-1 group/cta'
            )}
            aria-label={`${isAr ? 'استكشفي' : 'Explore'} ${name}`}
          >
            {t('viewDetails')}
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover/cta:translate-x-0.5 rtl:group-hover/cta:-translate-x-0.5"
            >
              {isAr ? '←' : '→'}
            </span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
