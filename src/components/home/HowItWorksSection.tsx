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
      className="section-sl bg-background"
      aria-labelledby="how-heading"
    >
      <div className="container-sl">
        <motion.div
          className="text-center max-w-xl mx-auto mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <p className="overline-sl mb-3">{t('overline')}</p>
          <h2 id="how-heading" className="heading-sl-lg mb-4">{t('title')}</h2>
          <p className="text-body-muted">{t('subtitle')}</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 relative"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-10 start-[12.5%] end-[12.5%] h-px bg-[var(--border-subtle)] z-0"
            aria-hidden="true"
          />

          {howItWorksSteps.map((step) => (
            <motion.div
              key={step.step}
              variants={staggerItem}
              className="flex flex-col items-center text-center px-4 py-6 relative z-10"
            >
              {/* Step number circle */}
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex flex-col items-center justify-center mb-5',
                  'bg-[var(--color-sand-100)] border border-[var(--color-sand-300)]',
                  'transition-colors duration-300'
                )}
              >
                <span className="text-[var(--color-sand-600)] text-sm mb-1" aria-hidden="true">
                  {step.icon}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                  {String(step.step).padStart(2, '0')}
                </span>
              </div>

              <h3 className="font-medium text-sm text-foreground mb-2">
                {isAr ? step.title_ar : step.title_en}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[160px] mx-auto">
                {isAr ? step.description_ar : step.description_en}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
