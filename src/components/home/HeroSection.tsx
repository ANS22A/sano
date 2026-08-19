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
            className="inline-flex items-center gap-2 mb-6 md:mb-8"
            aria-hidden="true"
          >
            <span className="w-8 h-px bg-white/40" />
            <span className="text-white/70 text-xs tracking-[0.2em] uppercase font-medium">
              {t('overline')}
            </span>
            <span className="w-8 h-px bg-white/40" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-white leading-[1.05] mb-6 md:mb-8">
            <span
              className={cn(
                'block',
                'text-[clamp(3rem,7vw,6.5rem)]',
                'font-light tracking-tight'
              )}
            >
              {t('titleLine1')}
            </span>
            <span
              className={cn(
                'block',
                'text-[clamp(3rem,7vw,6.5rem)]',
                'font-light tracking-tight',
                'text-[var(--color-sand-200)]'
              )}
            >
              {t('titleLine2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              'text-white/80 text-base md:text-lg lg:text-xl',
              'max-w-2xl leading-relaxed mb-10 md:mb-12',
              'font-body'
            )}
          >
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/booking"
              className={cn(
                'btn btn-lg btn-primary',
                'min-w-[200px] justify-center'
              )}
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/services"
              className={cn(
                'btn btn-lg',
                'border border-white/40 text-white',
                'hover:bg-white/10 hover:border-white/70',
                'transition-colors duration-200',
                'min-w-[200px] justify-center'
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
                <span className="text-[var(--color-sand-300)] text-xs" aria-hidden="true">
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
