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
      className="py-16 lg:py-24 bg-background border-b border-border-subtle relative overflow-hidden"
      aria-labelledby="categories-heading"
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
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center gap-1.5"
            >
              {t('viewAll')}
              <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground max-w-xl mb-12 text-base leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Category grid */}
        <motion.div
          className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
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
                  'border border-border-subtle bg-background shadow-subtle',
                  'transition-all duration-300',
                  'hover:border-accent/50 hover:bg-surface-warm',
                  'hover:shadow-elevated hover:-translate-y-1.5'
                )}
              >
                {/* Icon bubble */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center mb-4',
                    'bg-surface-lavender text-primary ring-1 ring-accent/30',
                    'text-xl shadow-xs',
                    'group-hover:bg-primary group-hover:text-accent group-hover:scale-105 transition-all duration-300'
                  )}
                  aria-hidden="true"
                >
                  {cat.icon}
                </div>

                {/* Name */}
                <h3 className="font-display font-medium text-sm text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors">
                  {isAr ? cat.name_ar : cat.name_en}
                </h3>

                {/* Count */}
                <p className="text-[11px] text-muted-foreground tabular-nums">
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

