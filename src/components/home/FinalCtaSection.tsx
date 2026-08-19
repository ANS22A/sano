'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

export function FinalCtaSection() {
  const t = useTranslations('home.finalCta')
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Image
          src="/images/hero/hero-bg.jpg"
          alt=""
          fill
          quality={60}
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-warm)] via-transparent to-[var(--color-surface-warm)]" />
        <div className="absolute inset-0 bg-[var(--color-surface-warm)]/80" />
      </div>

      <div className="relative z-10 section-sl">
        <div className="container-sl text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.85 } } }}
          >
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
              <span className="w-12 h-px bg-[var(--color-sand-400)]" />
              <span className="text-[var(--color-sand-500)] text-lg">✦</span>
              <span className="w-12 h-px bg-[var(--color-sand-400)]" />
            </div>

            <p className="overline-sl mb-4">{t('overline')}</p>
            <h2
              id="final-cta-heading"
              className={cn(
                'font-display font-light leading-[1.05] mb-6',
                'text-[clamp(2rem,4.5vw,3.5rem)] text-foreground'
              )}
            >
              {t('title')}
            </h2>
            <p className="text-body-muted mb-10 text-base">{t('subtitle')}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
                className="btn btn-lg btn-primary min-w-[220px] justify-center"
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href="/services"
                className="btn btn-lg btn-secondary min-w-[220px] justify-center"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
