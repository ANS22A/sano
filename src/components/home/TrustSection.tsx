'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { brandPrinciples } from '@/data/content.data'

export function TrustSection() {
  const t = useTranslations('home.trust')
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="section-sl bg-[var(--color-surface-warm)] border-b border-[var(--border-subtle)]"
      aria-labelledby="trust-heading"
    >
      <div className="container-sl">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <p className="overline-sl mb-3">{t('overline')}</p>
          <h2 id="trust-heading" className="heading-sl-md mb-4">{t('title')}</h2>
          <p className="text-body-muted">{t('subtitle')}</p>
        </motion.div>

        {/* Principles grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {brandPrinciples.map((principle) => {
            const titleKey = principle.id === 'privacy' ? 'privacy'
              : principle.id === 'expertise' ? 'expertise'
              : principle.id === 'personalised' ? 'personalised'
              : 'quality'
            const descKey = (titleKey + 'Desc') as 'privacyDesc' | 'expertiseDesc' | 'personalisedDesc' | 'qualityDesc'

            return (
              <motion.div
                key={principle.id}
                variants={staggerItem}
                className={cn(
                  'group flex flex-col items-start p-6 lg:p-7',
                  'rounded-sm border border-[var(--border-subtle)]',
                  'bg-background',
                  'transition-all duration-300',
                  'hover:border-[var(--color-sand-400)] hover:shadow-[0_4px_24px_rgba(26,23,20,0.06)]'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-sm flex items-center justify-center mb-5',
                    'bg-[var(--color-sand-100)] text-[var(--color-sand-700)]',
                    'text-lg font-light',
                    'group-hover:bg-[var(--color-sand-200)] transition-colors duration-300'
                  )}
                  aria-hidden="true"
                >
                  {principle.icon}
                </div>

                {/* Title */}
                <h3 className="heading-sl-xs mb-2">{t(titleKey)}</h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {t(descKey)}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
