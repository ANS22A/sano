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
      className="relative section-sl overflow-hidden bg-[var(--color-charcoal,#1a1714)]"
      aria-labelledby="signature-heading"
    >
      {/* Background image — hero bg reused at lower opacity */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Image
          src="/images/hero/hero-bg.jpg"
          alt=""
          fill
          quality={70}
          sizes="100vw"
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-e from-black/90 via-black/60 to-transparent" />
      </div>

      <div className="relative z-10 container-sl">
        <div className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center'
        )}>
          {/* Content */}
          <motion.div
            className={cn(isAr ? 'lg:order-2' : 'lg:order-1')}
            initial={{ opacity: 0, x: isAr ? 32 : -32 }}
            animate={controls}
            variants={{ visible: { opacity: 1, x: 0, transition: { duration: 0.85 } } }}
          >
            <p className="text-[var(--color-sand-300)] text-xs tracking-[0.2em] uppercase mb-4">{t('overline')}</p>

            <h2 id="signature-heading" className={cn(
              'font-display font-light leading-[1.05] mb-6',
              'text-[clamp(2.5rem,5vw,4rem)] text-white'
            )}>
              {t('title')}
            </h2>

            <p className="text-white/60 text-sm tracking-wide mb-6 font-medium">
              {t('subtitle')}
            </p>

            <p className="text-white/80 text-base leading-relaxed mb-8 max-w-lg">
              {t('body')}
            </p>

            {/* Details */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] mb-1">{isAr ? 'المدة' : 'Duration'}</p>
                <p className="text-white font-medium">{t('duration')}</p>
              </div>
              <div className="w-px h-10 bg-white/10" aria-hidden="true" />
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] mb-1">{isAr ? 'السعر' : 'Price'}</p>
                <p className="text-white font-medium">{t('price')}</p>
              </div>
              <div className="w-px h-10 bg-white/10" aria-hidden="true" />
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] mb-1">{isAr ? 'يشمل' : 'Includes'}</p>
                <p className="text-white/70 text-xs leading-relaxed">{t('includes')}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className={cn(
                  'btn btn-lg',
                  'bg-[var(--color-sand-300)] text-[var(--color-charcoal,#1a1714)]',
                  'hover:bg-[var(--color-sand-200)]',
                  'transition-colors duration-200'
                )}
              >
                {t('cta')}
              </Link>
              <Link
                href="/packages/complete-ritual"
                className={cn(
                  'btn btn-lg',
                  'border border-white/25 text-white/80',
                  'hover:bg-white/8 hover:border-white/50 hover:text-white',
                  'transition-colors duration-200'
                )}
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </motion.div>

          {/* Visual side — decorative */}
          <motion.div
            className={cn(
              'relative hidden lg:flex',
              isAr ? 'lg:order-1' : 'lg:order-2',
              'items-center justify-center'
            )}
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
