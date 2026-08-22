'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

export function ServicesHero() {
  const t = useTranslations('services.hero')
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className={cn(
        'relative bg-[var(--color-surface-warm)]',
        'border-b border-[var(--border-subtle)]',
        'pt-[calc(var(--nav-height-desktop)+3rem)] pb-12 lg:pb-16'
      )}
      aria-labelledby="services-hero-heading"
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, var(--primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container-sl relative z-10">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.75 } } }}
        >
          <p className="overline-sl mb-4">{t('overline')}</p>
          <h1 id="services-hero-heading" className="heading-sl-xl mb-5">
            {t('title')}
          </h1>
          <p className="text-body-muted max-w-xl">{t('subtitle')}</p>
        </motion.div>
      </div>
    </section>
  )
}
