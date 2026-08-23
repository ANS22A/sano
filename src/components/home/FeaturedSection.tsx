'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import type { ServiceWithCategory } from '@/data/types'

interface FeaturedSectionProps {
  featuredServices: ServiceWithCategory[]
}

export function FeaturedSection({ featuredServices }: FeaturedSectionProps) {
  const t = useTranslations('home.featured')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  // Show max 6 featured services
  const displayServices = featuredServices.slice(0, 6)

  return (
    <section
      ref={ref}
      className="section-sl bg-[var(--color-surface-warm)]"
      aria-labelledby="featured-heading"
    >
      <div className="container-sl">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 lg:mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <p className="overline-sl mb-3">{t('overline')}</p>
            <h2 id="featured-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } } }}
            className="hidden sm:block flex-shrink-0"
          >
            <Link
              href="/services"
              className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
            >
              {t('viewAll')}
              <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="text-body-muted max-w-xl mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Services grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {displayServices.map((service) => (
            <motion.article
              key={service.id}
              variants={staggerItem}
              className={cn(
                'group',
                'relative flex flex-col overflow-hidden',
                'rounded-sm border border-[var(--border-subtle)]',
                'bg-background',
                'transition-all duration-350',
                'hover:border-border',
                'hover:shadow-[0_12px_40px_rgba(26,23,20,0.1)]',
              )}
            >
              {/* Image */}
              <div
                className={cn(
                  'relative h-52 w-full flex-shrink-0 overflow-hidden',
                  'bg-gradient-to-br from-background to-surface'
                )}
                aria-hidden="true"
              >
                {service.image_url ? (
                  <Image
                    src={service.image_url}
                    alt={isAr ? service.name_ar : service.name_en}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <span className="text-5xl font-display font-light text-primary">✦</span>
                  </div>
                )}
                
                {/* Popular badge */}
                {service.is_popular && (
                  <div className={cn(
                    'absolute top-3 start-3 z-10',
                    'px-2.5 py-1 rounded-sm',
                    'bg-background/90 backdrop-blur-[4px]',
                    'text-[10px] tracking-[0.15em] uppercase font-medium text-foreground'
                  )}>
                    {isAr ? 'الأكثر طلباً' : 'Popular'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                {/* Category */}
                <p className="text-[10px] tracking-[0.18em] uppercase text-[var(--color-text-muted)] mb-2">
                  {isAr ? service.category.name_ar : service.category.name_en}
                </p>

                {/* Name */}
                <h3 className="font-display text-lg font-light text-foreground mb-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors duration-200">
                  {isAr ? service.name_ar : service.name_en}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 flex-1 line-clamp-2">
                  {isAr ? service.description_ar : service.description_en}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {service.price_sar} {isAr ? 'ريال' : 'SAR'}
                    </span>
                    <span className="text-[var(--border)] text-xs">·</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {service.duration_minutes} {t('duration')}
                    </span>
                  </div>

                  <Link
                    href="/booking"
                    className={cn(
                      'text-xs font-medium text-[var(--color-accent)]',
                      'hover:text-foreground transition-colors duration-200',
                      'flex items-center gap-1'
                    )}
                  >
                    {t('book')}
                    <span aria-hidden="true">{isAr ? '←' : '→'}</span>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* View all CTA */}
        <motion.div
          className="mt-10 md:mt-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 } } }}
        >
          <Link
            href="/services"
            className={cn(
              'btn btn-md btn-secondary',
              'inline-flex items-center gap-2'
            )}
          >
            {t('viewAll')}
            <span aria-hidden="true">{isAr ? '←' : '→'}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

