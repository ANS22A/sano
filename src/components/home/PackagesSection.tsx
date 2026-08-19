'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { featuredPackages } from '@/data/content.data'

export function PackagesSection() {
  const t = useTranslations('home.packages')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="section-sl bg-[var(--color-surface-warm)]"
      aria-labelledby="packages-heading"
    >
      <div className="container-sl">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <p className="overline-sl mb-3">{t('overline')}</p>
            <h2 id="packages-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } } }}
            className="hidden sm:block flex-shrink-0"
          >
            <Link
              href="/packages"
              className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
            >
              {t('viewAll')} <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="text-body-muted max-w-xl mb-12"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{ visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Packages grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {featuredPackages.slice(0, 3).map((pkg) => (
            <motion.article
              key={pkg.id}
              variants={staggerItem}
              className={cn(
                'group flex flex-col',
                'rounded-sm border border-[var(--border-subtle)] bg-background',
                'overflow-hidden',
                'transition-all duration-350',
                'hover:border-[var(--color-sand-400)]',
                'hover:shadow-[0_12px_40px_rgba(26,23,20,0.1)]',
              )}
            >
              {/* Image placeholder */}
              <div
                className={cn(
                  'h-48 w-full flex-shrink-0',
                  'bg-gradient-to-br from-[var(--color-sand-200)] to-[var(--color-sand-300)]',
                  'flex items-center justify-center relative overflow-hidden'
                )}
                aria-hidden="true"
              >
                {pkg.max_guests > 1 && (
                  <div className="absolute top-3 start-3 px-2.5 py-1 rounded-sm bg-background/90 text-[10px] tracking-[0.15em] uppercase font-medium">
                    {isAr ? 'للاثنين' : 'For 2'}
                  </div>
                )}
                <span className="text-5xl text-[var(--color-sand-500)] opacity-40 font-display font-light">✧</span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5 lg:p-6">
                {/* Tagline */}
                {(isAr ? pkg.tagline_ar : pkg.tagline_en) && (
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-2">
                    {isAr ? pkg.tagline_ar : pkg.tagline_en}
                  </p>
                )}

                {/* Name */}
                <h3 className="font-display text-lg font-light text-foreground mb-3 leading-snug group-hover:text-[var(--color-accent)] transition-colors duration-200">
                  {isAr ? pkg.name_ar : pkg.name_en}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 flex-1 line-clamp-2">
                  {isAr ? pkg.description_ar : pkg.description_en}
                </p>

                {/* Included services */}
                <div className="mb-4">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.12em] mb-2">
                    {t('includes')}
                  </p>
                  <ul className="space-y-1">
                    {(isAr ? pkg.included_services_ar : pkg.included_services_en).map((s) => (
                      <li key={s} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-[var(--color-sand-500)] mt-0.5 flex-shrink-0" aria-hidden="true">◇</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price + meta */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <div>
                    <p className="text-base font-medium text-foreground tabular-nums">
                      {pkg.price_sar} {isAr ? 'ريال' : 'SAR'}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {pkg.total_duration_minutes} {t('duration')}
                      {pkg.max_guests > 1 && ` · ${pkg.max_guests} ${t('guests')}`}
                    </p>
                  </div>
                  <Link
                    href="/booking"
                    className="btn btn-sm btn-primary"
                  >
                    {t('book')}
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* View all */}
        <div className="mt-10 text-center sm:hidden">
          <Link href="/packages" className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200">
            {t('viewAll')} {isAr ? '←' : '→'}
          </Link>
        </div>
      </div>
    </section>
  )
}
