'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

export function GiftCardsSection() {
  const t = useTranslations('home.giftCards')
  const { ref, controls } = useReveal()

  const features = t('features').split(' · ')

  return (
    <section
      ref={ref}
      className="section-sl bg-background overflow-hidden"
      aria-labelledby="gift-cards-heading"
    >
      <div className="container-sl">
        <div className={cn(
          'relative rounded-sm overflow-hidden',
          'bg-gradient-to-br from-[var(--color-sand-900,#1a1714)] via-[var(--color-sand-800,#2a2420)] to-[var(--color-sand-900,#1a1714)]',
          'p-10 md:p-14 lg:p-16'
        )}>
          {/* Decorative elements */}
          <div className="absolute top-6 end-6 text-[6rem] leading-none text-white/5 font-display font-light" aria-hidden="true">
            ♢
          </div>
          <div className="absolute bottom-0 start-0 w-40 h-40 rounded-full border border-white/5 -translate-x-1/2 translate-y-1/2" aria-hidden="true" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Copy */}
            <motion.div
              className="max-w-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={controls}
              variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.75 } } }}
            >
              <p className="text-[var(--color-sand-300)] text-xs tracking-[0.2em] uppercase mb-4">
                {t('overline')}
              </p>
              <h2 id="gift-cards-heading" className={cn(
                'font-display font-light text-white leading-[1.08] mb-5',
                'text-[clamp(1.8rem,4vw,3rem)]'
              )}>
                {t('title')}
              </h2>
              <p className="text-white/65 leading-relaxed mb-6">
                {t('subtitle')}
              </p>
              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {features.map((f) => (
                  <span
                    key={f}
                    className={cn(
                      'px-3 py-1.5 rounded-sm text-xs',
                      'border border-white/15 text-white/60'
                    )}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={controls}
              variants={{ visible: { opacity: 1, scale: 1, transition: { duration: 0.7, delay: 0.2 } } }}
            >
              <Link
                href="/gift-cards"
                className={cn(
                  'btn btn-lg',
                  'bg-[var(--color-sand-300)] text-[#1a1714]',
                  'hover:bg-[var(--color-sand-200)]',
                  'transition-colors duration-200',
                  'whitespace-nowrap'
                )}
              >
                {t('cta')}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
