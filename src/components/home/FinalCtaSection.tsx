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
      className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-background via-surface-pink/20 to-surface-warm border-t border-border-subtle"
      aria-labelledby="final-cta-heading"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container-sl text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.85 } } }}
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
            <span className="w-12 h-px bg-accent/40" />
            <span className="text-accent text-xl animate-pulse">✦</span>
            <span className="w-12 h-px bg-accent/40" />
          </div>

          <div className="inline-flex items-center gap-2 mb-3">
            <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
          </div>
          
          <h2
            id="final-cta-heading"
            className={cn(
              'font-display font-light leading-[1.1] mb-6',
              'text-[clamp(2.2rem,4.5vw,3.6rem)] text-foreground'
            )}
          >
            {t('title')}
          </h2>
          <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed max-w-xl mx-auto">{t('subtitle')}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="btn btn-lg bg-accent text-foreground font-semibold hover:bg-accent/90 shadow-luxury hover:scale-[1.02] min-w-[220px] justify-center transition-all duration-200"
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/services"
              className="btn btn-lg btn-secondary min-w-[220px] justify-center border border-border-subtle shadow-sm hover:border-accent/40"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

