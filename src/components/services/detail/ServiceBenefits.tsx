'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

interface ServiceBenefitsProps {
  benefits_ar: string[]
  benefits_en: string[]
}

export function ServiceBenefits({ benefits_ar, benefits_en }: ServiceBenefitsProps) {
  const t = useTranslations('services.detail')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  const benefits = isAr ? benefits_ar : benefits_en
  if (!benefits || benefits.length === 0) return null

  return (
    <section ref={ref} aria-labelledby="benefits-heading" className="py-12 bg-[var(--color-surface-warm)] border-y border-[var(--border-subtle)]">
      <div className="container-sl">
        <motion.h2
          id="benefits-heading"
          className="heading-sl-md mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
        >
          {t('benefitsTitle')}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              className={cn(
                'flex items-start gap-3 p-5 rounded-sm',
                'border border-[var(--border-subtle)] bg-background'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, delay: i * 0.1 },
                },
              }}
            >
              <span
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-surface flex items-center justify-center"
                aria-hidden="true"
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="var(--color-sand-700)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm text-foreground leading-snug">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

