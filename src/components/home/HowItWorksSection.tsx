'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { howItWorksSteps } from '@/data/content.data'

export function HowItWorksSection() {
  const t = useTranslations('home.howItWorks')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-surface-warm border-b border-border-subtle relative overflow-hidden"
      aria-labelledby="how-heading"
    >
      <div className="container-sl relative z-10">
        <motion.div
          className="text-center max-w-xl mx-auto mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-accent text-xs">✦</span>
            <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
          </div>
          <h2 id="how-heading" className="heading-sl-lg mb-4">{t('title')}</h2>
          <p className="text-muted-foreground text-base leading-relaxed">{t('subtitle')}</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 relative"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-10 start-[12.5%] end-[12.5%] h-0.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30 z-0"
            aria-hidden="true"
          />

          {howItWorksSteps.map((step) => (
            <motion.div
              key={step.step}
              variants={staggerItem}
              className="flex flex-col items-center text-center px-4 py-6 relative z-10 group"
            >
              {/* Step number circle */}
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex flex-col items-center justify-center mb-5',
                  'bg-background border-2 border-accent/60 shadow-medium',
                  'group-hover:border-primary group-hover:scale-105 group-hover:shadow-luxury',
                  'transition-all duration-300'
                )}
              >
                <span className="text-primary text-base mb-0.5 group-hover:text-accent transition-colors" aria-hidden="true">
                  {step.icon}
                </span>
                <span className="text-[11px] font-mono font-bold text-accent tabular-nums">
                  {String(step.step).padStart(2, '0')}
                </span>
              </div>

              <h3 className="font-display font-medium text-base text-foreground mb-2 group-hover:text-primary transition-colors">
                {isAr ? step.title_ar : step.title_en}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                {isAr ? step.description_ar : step.description_en}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

