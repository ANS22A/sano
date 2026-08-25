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
          'bg-gradient-to-br from-primary via-primary-hover to-[#351a44]',
          'p-10 md:p-14 lg:p-16 border border-accent/30 shadow-luxury'
        )}>
          {/* Decorative elements */}
          <div className="absolute top-6 end-8 text-[7rem] leading-none text-accent/10 font-display font-light select-none" aria-hidden="true">
            ✦
          </div>
          <div className="absolute bottom-0 start-0 w-52 h-52 rounded-full bg-accent/10 blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Copy */}
            <motion.div
              className="max-w-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={controls}
              variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.75 } } }}
            >
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-accent text-xs">✦</span>
                <p className="text-accent text-xs tracking-[0.25em] uppercase font-semibold">
                  {t('overline')}
                </p>
              </div>
              <h2 id="gift-cards-heading" className={cn(
                'font-display font-light text-white leading-[1.08] mb-5',
                'text-[clamp(2rem,4vw,3.2rem)]'
              )}>
                {t('title')}
              </h2>
              <p className="text-white/80 leading-relaxed mb-6 text-base">
                {t('subtitle')}
              </p>
              {/* Feature pills */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                {features.map((f) => (
                  <span
                    key={f}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-medium',
                      'border border-accent/30 bg-accent/10 text-accent backdrop-blur-sm'
                    )}
                  >
                    ✦ {f}
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
                  'bg-accent text-foreground font-semibold',
                  'hover:bg-accent/90 shadow-luxury hover:scale-[1.02]',
                  'transition-all duration-200',
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

