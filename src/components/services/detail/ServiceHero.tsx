'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import type { ServiceWithCategory } from '@/data/types'

interface ServiceHeroProps {
  service: ServiceWithCategory
}

export function ServiceHero({ service }: ServiceHeroProps) {
  const t = useTranslations('services.detail')
  const locale = useLocale()
  const isAr = locale === 'ar'

  const name = isAr ? service.name_ar : service.name_en
  const shortDesc = isAr ? service.short_description_ar : service.short_description_en
  const catName = isAr ? service.category.name_ar : service.category.name_en

  return (
    <section className="border-b border-[var(--border-subtle)]">
      <div className={cn(
        'container-sl grid gap-0',
        'lg:grid-cols-2 lg:min-h-[480px]'
      )}>
        {/* Image panel */}
        <div className="relative h-64 lg:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-background to-accent">
          {service.image_url ? (
            <Image
              src={service.image_url}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[120px] text-accent font-display font-light opacity-40 select-none"
                aria-hidden="true"
              >
                ✦
              </span>
            </div>
          )}

          {/* Overlay gradient for content legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </div>

        {/* Content panel */}
        <motion.div
          className="py-10 lg:py-16 px-0 lg:px-12 flex flex-col justify-center"
          initial={{ opacity: 0, x: isAr ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Category label */}
          <p className="overline-sl mb-4">{catName}</p>

          {/* Service name */}
          <h1 className="heading-sl-xl mb-4">{name}</h1>

          {/* Short description */}
          <p className="text-body-muted mb-8 max-w-md">{shortDesc}</p>

          {/* Meta row */}
          <div className="flex items-center gap-6 mb-8">
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--color-text-muted)] mb-1">
                {t('price')}
              </p>
              <p className="font-display text-2xl font-light text-foreground tabular-nums">
                {service.price_sar}
                <span className="text-sm ms-1 text-[var(--color-text-muted)]">{t('currency')}</span>
              </p>
            </div>
            <div className="w-px h-10 bg-[var(--border-subtle)]" aria-hidden="true" />
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--color-text-muted)] mb-1">
                {t('duration')}
              </p>
              <p className="font-display text-2xl font-light text-foreground tabular-nums">
                {service.duration_minutes}
                <span className="text-sm ms-1 text-[var(--color-text-muted)]">{t('minutes')}</span>
              </p>
            </div>
          </div>

          {/* Book CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/booking?service=${service.slug}`}
              className="btn btn-lg btn-primary inline-flex items-center justify-center gap-2"
            >
              {t('bookCta')}
            </Link>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">{t('bookCtaNote')}</p>
        </motion.div>
      </div>
    </section>
  )
}

