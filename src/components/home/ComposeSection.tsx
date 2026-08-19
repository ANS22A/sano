'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

export function ComposeSection() {
  const t = useTranslations('home.compose')
  const { ref, controls } = useReveal()

  const steps = [
    { num: '01', label: t('step1') },
    { num: '02', label: t('step2') },
    { num: '03', label: t('step3') },
  ]

  return (
    <section
      ref={ref}
      className="section-sl bg-background border-y border-[var(--border-subtle)]"
      aria-labelledby="compose-heading"
    >
      <div className="container-sl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.75 } } }}
          >
            <p className="overline-sl mb-3">{t('overline')}</p>
            <h2 id="compose-heading" className="heading-sl-lg mb-5">{t('title')}</h2>
            <p className="text-body-muted mb-10">{t('subtitle')}</p>

            {/* Steps */}
            <div className="space-y-6 mb-10">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-8 h-8 flex-shrink-0 rounded-sm flex items-center justify-center',
                      'bg-[var(--color-sand-100)] text-[var(--color-sand-700)]',
                      'text-xs font-medium tabular-nums'
                    )}
                    aria-hidden="true"
                  >
                    {step.num}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed pt-1.5">{step.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/booking"
                className="btn btn-md btn-primary"
              >
                {t('cta')}
              </Link>
              <p className="text-xs text-[var(--color-text-muted)] italic">{t('note')}</p>
            </div>
          </motion.div>

          {/* Visual — abstract orbits */}
          <motion.div
            className="relative flex items-center justify-center h-64 lg:h-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={controls}
            variants={{ visible: { opacity: 1, scale: 1, transition: { duration: 0.9, delay: 0.2 } } }}
            aria-hidden="true"
          >
            <div className="relative w-64 h-64">
              {/* Animated orbit rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[var(--color-sand-300)]"
                  style={{ margin: `${i * 28}px` }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{
                    duration: 20 + i * 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}
              {/* Centre */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-sand-100)] flex items-center justify-center">
                  <span className="text-2xl text-[var(--color-sand-600)]">✦</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
