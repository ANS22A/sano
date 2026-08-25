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
      className="py-16 lg:py-24 bg-surface-pink/30 border-b border-border-subtle relative overflow-hidden"
      aria-labelledby="trust-heading"
    >
      <div className="container-sl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-accent text-xs">✦</span>
            <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
          </div>
          <h2 id="trust-heading" className="heading-sl-md mb-4">{t('title')}</h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">{t('subtitle')}</p>
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
                  'rounded-sm border border-border-subtle',
                  'bg-background shadow-subtle',
                  'transition-all duration-300',
                  'hover:border-accent/40 hover:shadow-elevated hover:-translate-y-1'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center mb-5',
                    'bg-surface-lavender text-primary ring-1 ring-accent/30',
                    'text-lg font-light shadow-xs',
                    'group-hover:bg-primary group-hover:text-accent group-hover:scale-105 transition-all duration-300'
                  )}
                  aria-hidden="true"
                >
                  {principle.icon}
                </div>

                {/* Title */}
                <h3 className="font-display font-medium text-base text-foreground mb-2 group-hover:text-primary transition-colors">{t(titleKey)}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
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

