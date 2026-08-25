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
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-sm',
        'border border-border-subtle bg-background shadow-subtle',
        'transition-all duration-300',
        'hover:border-accent/40 hover:shadow-elevated hover:-translate-y-1'
      )}
    >
      {/* Image / Artwork Banner */}
      <div
        className={cn(
          'relative h-52 flex-shrink-0 overflow-hidden',
          'bg-gradient-to-br from-surface-lavender via-surface-pink to-accent/15 flex items-center justify-center'
        )}
        aria-hidden="true"
      >
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary/70 p-4 text-center">
            <span className="text-3xl text-accent mb-1 animate-pulse">✦</span>
            <span className="font-display text-xs tracking-widest text-primary uppercase font-medium">{catName || 'SANO LUNA'}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{isAr ? 'عناية فاخرة في منزلك' : 'Luxury At-Home Spa'}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 start-3 flex gap-1.5 z-10">
          {service.is_popular && (
            <span className={cn(
              'px-2.5 py-1 rounded-sm text-[10px] tracking-wider uppercase font-semibold',
              'bg-primary text-white border border-accent/40 shadow-sm backdrop-blur-sm'
            )}>
              {t('popular')}
            </span>
          )}
          {service.is_featured && !service.is_popular && (
            <span className={cn(
              'px-2.5 py-1 rounded-sm text-[10px] tracking-wider uppercase font-semibold',
              'bg-accent text-foreground shadow-sm backdrop-blur-sm'
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
          <p className="text-[10px] tracking-widest uppercase text-accent font-semibold mb-1.5">
            {catName}
          </p>
        )}

        {/* Name */}
        <h3 className={cn(
          'font-display text-lg font-medium text-foreground leading-snug mb-2',
          'group-hover:text-primary transition-colors duration-200'
        )}>
          {name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
          {shortDesc}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
          {/* Price & duration */}
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-foreground tabular-nums font-display">
              {service.price_sar} <span className="text-xs text-muted-foreground font-sans">{t('currency')}</span>
            </span>
            <span className="text-border-strong text-xs" aria-hidden="true">·</span>
            <span className="text-xs text-muted-foreground">
              {service.duration_minutes} {t('duration')}
            </span>
          </div>

          {/* CTA */}
          <Link
            href={`/booking?service=${service.slug}`}
            className={cn(
              'text-xs font-semibold',
              'text-primary group-hover/cta:text-accent',
              'transition-colors duration-200',
              'flex items-center gap-1 group/cta'
            )}
            aria-label={`${isAr ? 'استكشفي' : 'Explore'} ${name}`}
          >
            <span>{t('viewDetails')}</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1 text-accent font-bold"
            >
              {isAr ? '←' : '→'}
            </span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

