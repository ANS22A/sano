'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// HERO SECTION
// Full viewport, transparent-to-overlay gradient.
// The Header overlays this section at state A (transparent).
// ─────────────────────────────────────────────

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
  },
}

const contentVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number],
    },
  },
}

const trustVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.85,
      ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number],
    },
  },
}

export function HeroSection() {
  const t = useTranslations('home.hero')

  return (
    <section
      className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden"
      aria-label={t('titleLine1') + ' ' + t('titleLine2')}
    >
      {/* Background image */}
      <motion.div
        className="absolute inset-0 z-0"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="/images/hero/hero-bg.jpg"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        {/* Gradient overlays for legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75"
          aria-hidden="true"
        />
        {/* Subtle radial vignette */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]"
          aria-hidden="true"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container-sl w-full pt-[80px] lg:pt-[100px]">
        <motion.div
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Overline */}
          <div
            className="inline-flex items-center gap-3 mb-6 md:mb-8 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10"
            aria-hidden="true"
          >
            <span className="text-accent text-xs">✦</span>
            <span className="text-accent text-xs tracking-[0.25em] uppercase font-medium">
              {t('overline')}
            </span>
            <span className="text-accent text-xs">✦</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-white leading-[1.08] mb-6 md:mb-8">
            <span
              className={cn(
                'block',
                'text-[clamp(2.75rem,6.5vw,5.75rem)]',
                'font-light tracking-tight'
              )}
            >
              {t('titleLine1')}
            </span>
            <span
              className={cn(
                'block',
                'text-[clamp(2.75rem,6.5vw,5.75rem)]',
                'font-light tracking-tight',
                'text-accent'
              )}
            >
              {t('titleLine2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              'text-white/85 text-base md:text-lg lg:text-xl',
              'max-w-2xl leading-relaxed mb-10 md:mb-12',
              'font-body drop-shadow-sm'
            )}
          >
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/booking"
              className={cn(
                'btn btn-lg bg-accent text-foreground hover:bg-accent/90',
                'shadow-luxury hover:scale-[1.02] transition-all duration-300 font-semibold',
                'min-w-[210px] justify-center text-sm tracking-wide'
              )}
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/services"
              className={cn(
                'btn btn-lg',
                'border border-white/50 text-white bg-white/10 backdrop-blur-md',
                'hover:bg-white/20 hover:border-white/80',
                'transition-all duration-200',
                'min-w-[210px] justify-center text-sm tracking-wide'
              )}
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Trust indicators — bottom bar */}
      <motion.div
        className={cn(
          'absolute bottom-0 inset-x-0 z-10',
          'border-t border-white/10',
          'bg-black/20 backdrop-blur-[4px]',
          'py-4'
        )}
        variants={trustVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container-sl">
          <div className="flex items-center justify-center gap-6 md:gap-10">
            {[
              { key: 'trustPrivacy', icon: '◇' },
              { key: 'trustPay', icon: '✦' },
              { key: 'trustConfirmed', icon: '◌' },
            ].map((item, i) => (
              <div
                key={item.key}
                className={cn(
                  'flex items-center gap-2',
                  i > 0 && 'hidden sm:flex'
                )}
              >
                <span className="text-accent text-xs" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-white/70 text-xs tracking-wide">
                  {t(item.key as 'trustPrivacy' | 'trustPay' | 'trustConfirmed')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className={cn(
          'absolute bottom-16 md:bottom-20 start-1/2 -translate-x-1/2 z-10',
          'flex flex-col items-center gap-1.5'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden="true"
      >
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}

