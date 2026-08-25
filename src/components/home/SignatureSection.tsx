'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

export function SignatureSection() {
  const t = useTranslations('home.signature')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden bg-primary text-white"
      aria-labelledby="signature-heading"
    >
      {/* Ambient background glow & radial gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -start-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -end-24 w-96 h-96 bg-primary-hover rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container-sl">
        <div className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center'
        )}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 32 : -32 }}
            animate={controls}
            variants={{ visible: { opacity: 1, x: 0, transition: { duration: 0.85 } } }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-accent text-xs">✦</span>
              <p className="text-accent text-xs tracking-[0.25em] uppercase font-semibold">{t('overline')}</p>
            </div>

            <h2 id="signature-heading" className={cn(
              'font-display font-light leading-[1.08] mb-6',
              'text-[clamp(2.4rem,4.5vw,3.8rem)] text-white'
            )}>
              {t('title')}
            </h2>

            <p className="text-accent/90 text-sm tracking-wider mb-6 font-medium uppercase">
              {t('subtitle')}
            </p>

            <p className="text-white/80 text-base leading-relaxed mb-8 max-w-lg">
              {t('body')}
            </p>

            {/* Details */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/15">
              <div>
                <p className="text-[10px] text-accent/80 uppercase tracking-widest mb-1 font-semibold">{isAr ? 'المدة' : 'Duration'}</p>
                <p className="text-white font-medium text-base">{t('duration')}</p>
              </div>
              <div className="w-px h-10 bg-white/15" aria-hidden="true" />
              <div>
                <p className="text-[10px] text-accent/80 uppercase tracking-widest mb-1 font-semibold">{isAr ? 'السعر' : 'Price'}</p>
                <p className="text-white font-medium text-base">{t('price')}</p>
              </div>
              <div className="w-px h-10 bg-white/15" aria-hidden="true" />
              <div>
                <p className="text-[10px] text-accent/80 uppercase tracking-widest mb-1 font-semibold">{isAr ? 'يشمل' : 'Includes'}</p>
                <p className="text-white/80 text-xs leading-relaxed max-w-[200px]">{t('includes')}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link
                href="/booking"
                className={cn(
                  'btn btn-lg',
                  'bg-accent text-foreground font-semibold',
                  'hover:bg-accent/90 shadow-luxury hover:scale-[1.02]',
                  'transition-all duration-200'
                )}
              >
                {t('cta')}
              </Link>
              <Link
                href="/packages"
                className={cn(
                  'btn btn-lg',
                  'border border-white/30 text-white',
                  'hover:bg-white/10 hover:border-white/60 hover:text-white',
                  'transition-colors duration-200'
                )}
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </motion.div>

          {/* Visual side — decorative */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={controls}
            variants={{ visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.2 } } }}
            aria-hidden="true"
          >
            {/* Concentric rings — editorial decoration */}
            <div className="relative w-[360px] h-[360px]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-white/10"
                  style={{ margin: `${(i - 1) * 40}px` }}
                />
              ))}
              {/* Center mark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center">
                  <span className="text-4xl text-white/30 font-display font-light">✦</span>
                </div>
              </div>
              {/* Labels around rings */}
              {[
                { label: isAr ? 'حمام مغربي' : 'Moroccan Bath', angle: -60 },
                { label: isAr ? 'مانيكير · بديكير' : 'Mani · Pedi', angle: 60 },
                { label: isAr ? 'مساج كامل' : 'Full Massage', angle: 180 },
              ].map(({ label, angle }) => {
                const rad = (angle * Math.PI) / 180
                const r = 155
                const x = r * Math.cos(rad) + 180
                const y = r * Math.sin(rad) + 180
                return (
                  <div
                    key={label}
                    className="absolute text-[10px] text-white/40 tracking-wider text-center whitespace-nowrap"
                    style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                  >
                    {label}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

