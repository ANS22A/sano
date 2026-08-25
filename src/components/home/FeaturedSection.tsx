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
      className="py-20 lg:py-28 bg-surface-warm border-y border-border-subtle relative overflow-hidden"
      aria-labelledby="featured-heading"
    >
      <div className="container-sl relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 lg:mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-accent text-xs">✦</span>
              <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
            </div>
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
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center gap-1.5"
            >
              {t('viewAll')}
              <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="text-muted-foreground max-w-xl mb-12 text-base leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Services grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
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
                'rounded-sm border border-border-subtle bg-background shadow-subtle',
                'transition-all duration-300',
                'hover:border-accent/40 hover:shadow-elevated hover:-translate-y-1',
              )}
            >
              {/* Image */}
              <div
                className={cn(
                  'relative h-52 w-full flex-shrink-0 overflow-hidden',
                  'bg-gradient-to-br from-surface-lavender via-surface-pink to-accent/15 flex items-center justify-center'
                )}
                aria-hidden="true"
              >
                {service.image_url ? (
                  <Image
                    src={service.image_url}
                    alt={isAr ? service.name_ar : service.name_en}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-primary/70 p-4 text-center">
                    <span className="text-3xl text-accent mb-1 animate-pulse">✦</span>
                    <span className="font-display text-xs tracking-widest text-primary uppercase font-medium">{isAr ? service.category.name_ar : service.category.name_en}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{isAr ? 'عناية فاخرة في منزلك' : 'Luxury At-Home Spa'}</span>
                  </div>
                )}
                
                {/* Popular badge */}
                {service.is_popular && (
                  <div className={cn(
                    'absolute top-3 start-3 z-10',
                    'px-2.5 py-1 rounded-sm',
                    'bg-primary text-white border border-accent/40 shadow-sm backdrop-blur-sm',
                    'text-[10px] tracking-wider uppercase font-semibold'
                  )}>
                    {isAr ? 'الأكثر طلباً' : 'Popular'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                {/* Category */}
                <p className="text-[10px] tracking-widest uppercase text-accent font-semibold mb-1.5">
                  {isAr ? service.category.name_ar : service.category.name_en}
                </p>

                {/* Name */}
                <h3 className="font-display text-lg font-medium text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-200">
                  {isAr ? service.name_ar : service.name_en}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                  {isAr ? service.description_ar : service.description_en}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-foreground tabular-nums font-display">
                      {service.price_sar} <span className="text-xs text-muted-foreground font-sans">{isAr ? 'ريال' : 'SAR'}</span>
                    </span>
                    <span className="text-border-strong text-xs">·</span>
                    <span className="text-xs text-muted-foreground">
                      {service.duration_minutes} {t('duration')}
                    </span>
                  </div>

                  <Link
                    href={`/booking?service=${service.slug}`}
                    className={cn(
                      'text-xs font-semibold text-primary hover:text-accent',
                      'transition-colors duration-200',
                      'flex items-center gap-1 group/btn'
                    )}
                  >
                    <span>{t('book')}</span>
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 text-accent font-bold">
                      {isAr ? '←' : '→'}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* View all CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 } } }}
        >
          <Link
            href="/services"
            className={cn(
              'btn btn-md btn-secondary',
              'inline-flex items-center gap-2 border border-border-subtle shadow-sm hover:border-accent/40'
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

