'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { serviceCategories } from '@/data/categories.data'

export function CategoriesSection() {
  const t = useTranslations('home.categories')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="section-sl bg-background"
      aria-labelledby="categories-heading"
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
            <h2 id="categories-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.7, delay: 0.2 } } }}
            className="flex-shrink-0 hidden sm:block"
          >
            <Link
              href="/services"
              className={cn(
                'text-sm text-[var(--color-text-muted)]',
                'hover:text-foreground transition-colors duration-200',
                'flex items-center gap-1.5'
              )}
            >
              {t('viewAll')}
              <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-body-muted max-w-xl mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Category grid */}
        <motion.div
          className={cn(
            'grid gap-4',
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
          )}
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {serviceCategories.map((cat) => (
            <motion.div key={cat.id} variants={staggerItem}>
              <Link
                href={`/services?category=${cat.slug}`}
                className={cn(
                  'group flex flex-col items-center text-center',
                  'p-5 lg:p-6 rounded-sm',
                  'border border-[var(--border-subtle)]',
                  'bg-[var(--color-surface-warm)]',
                  'transition-all duration-300',
                  'hover:border-[var(--color-sand-400)]',
                  'hover:shadow-[0_8px_32px_rgba(26,23,20,0.08)]',
                  'hover:-translate-y-1'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                    'bg-[var(--color-sand-100)] text-[var(--color-sand-700)]',
                    'text-xl',
                    'group-hover:bg-[var(--color-sand-200)] transition-colors duration-300'
                  )}
                  aria-hidden="true"
                >
                  {cat.icon}
                </div>

                {/* Name */}
                <h3 className={cn(
                  'font-medium text-sm text-foreground leading-snug mb-2',
                  'group-hover:text-[var(--color-accent)] transition-colors duration-200'
                )}>
                  {isAr ? cat.name_ar : cat.name_en}
                </h3>

                {/* Count */}
                <p className="text-[11px] text-[var(--color-text-muted)] tabular-nums">
                  {cat.service_count} {t('services')}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/services"
            className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200"
          >
            {t('viewAll')} {isAr ? '←' : '→'}
          </Link>
        </div>
      </div>
    </section>
  )
}
