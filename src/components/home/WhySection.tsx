'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { brandPrinciples } from '@/data/content.data'

export function WhySection() {
  const t = useTranslations('home.why')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="section-sl bg-[var(--color-surface-warm)] border-y border-[var(--border-subtle)]"
      aria-labelledby="why-heading"
    >
      <div className="container-sl">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14 lg:mb-18"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <p className="overline-sl mb-3">{t('overline')}</p>
          <h2 id="why-heading" className="heading-sl-lg mb-4">{t('title')}</h2>
          <p className="text-body-muted">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-subtle)]"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {brandPrinciples.map((principle, i) => (
            <motion.div
              key={principle.id}
              variants={staggerItem}
              className={cn(
                'group bg-background p-8 lg:p-10',
                'flex items-start gap-5',
                'transition-colors duration-300',
                'hover:bg-[var(--color-sand-50,rgba(250,249,247,0.8))]'
              )}
            >
              {/* Step number */}
              <div
                className="flex-shrink-0 text-[var(--color-sand-300)] text-xs tracking-[0.2em] tabular-nums w-8 pt-1"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="flex-1">
                {/* Icon */}
                <div
                  className="text-[var(--color-sand-600)] text-xl mb-3"
                  aria-hidden="true"
                >
                  {principle.icon}
                </div>

                {/* Title */}
                <h3 className="font-medium text-base text-foreground mb-2">
                  {isAr ? principle.title_ar : principle.title_en}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {isAr ? principle.description_ar : principle.description_en}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
