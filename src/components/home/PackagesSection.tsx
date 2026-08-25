'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { featuredPackages } from '@/data/content.data'

export function PackagesSection() {
  const t = useTranslations('home.packages')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-background border-t border-border-subtle relative overflow-hidden"
      aria-labelledby="packages-heading"
    >
      <div className="container-sl relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 lg:mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-accent text-xs">✦</span>
              <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
            </div>
            <h2 id="packages-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } } }}
            className="hidden sm:block flex-shrink-0"
          >
            <Link
              href="/packages"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center gap-1.5"
            >
              {t('viewAll')} <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="text-muted-foreground max-w-xl mb-12 text-base leading-relaxed"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{ visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Packages grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {featuredPackages.slice(0, 3).map((pkg) => (
            <motion.article
              key={pkg.id}
              variants={staggerItem}
              className={cn(
                'group flex flex-col',
                'rounded-sm border border-border-subtle bg-background shadow-subtle',
                'overflow-hidden',
                'transition-all duration-300',
                'hover:border-accent/40 hover:shadow-elevated hover:-translate-y-1',
              )}
            >
              {/* Image / Artwork Banner */}
              <div
                className={cn(
                  'h-52 w-full flex-shrink-0',
                  'bg-gradient-to-br from-primary via-primary-hover to-surface-lavender',
                  'flex items-center justify-center relative overflow-hidden'
                )}
                aria-hidden="true"
              >
                {pkg.image_url ? (
                  <Image
                    src={pkg.image_url}
                    alt={isAr ? pkg.name_ar : pkg.name_en}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/90 p-4 text-center">
                    <span className="text-3xl text-accent mb-1 animate-pulse">✦</span>
                    <span className="font-display text-xs tracking-widest text-accent uppercase font-medium">{isAr ? 'باقة طقوس راقية' : 'Luxury Ritual'}</span>
                    <span className="text-[10px] text-white/60 mt-0.5">{isAr ? 'عناية متكاملة في منزلك' : 'Complete Home Wellness'}</span>
                  </div>
                )}
                
                {pkg.max_guests > 1 && (
                  <div className="absolute top-3 start-3 z-10 px-2.5 py-1 rounded-sm bg-primary/90 text-white text-[10px] tracking-wider uppercase font-medium border border-accent/30 backdrop-blur-sm">
                    {isAr ? 'لشخصين' : 'For 2 Guests'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                {/* Tagline */}
                {(isAr ? pkg.tagline_ar : pkg.tagline_en) && (
                  <p className="text-[10px] tracking-widest uppercase text-accent font-semibold mb-1.5">
                    {isAr ? pkg.tagline_ar : pkg.tagline_en}
                  </p>
                )}

                {/* Name */}
                <h3 className="font-display text-lg font-medium text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-200">
                  {isAr ? pkg.name_ar : pkg.name_en}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                  {isAr ? pkg.description_ar : pkg.description_en}
                </p>

                {/* Included services */}
                <div className="mb-6 bg-surface-muted/60 p-3.5 rounded-sm border border-border-subtle">
                  <p className="text-[10px] text-accent uppercase tracking-wider font-semibold mb-2">
                    {t('includes')}
                  </p>
                  <ul className="space-y-1">
                    {(isAr ? pkg.included_services_ar : pkg.included_services_en).map((s) => (
                      <li key={s} className="text-xs text-foreground flex items-center gap-1.5">
                        <span className="text-accent text-[10px]" aria-hidden="true">✦</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price + meta */}
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
                  <div>
                    <p className="text-base font-medium text-foreground tabular-nums font-display">
                      {pkg.price_sar} <span className="text-xs text-muted-foreground font-sans">{isAr ? 'ريال' : 'SAR'}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {pkg.total_duration_minutes} {t('duration')}
                      {pkg.max_guests > 1 && ` · ${pkg.max_guests} ${t('guests')}`}
                    </p>
                  </div>
                  <Link
                    href={`/booking?package=${pkg.slug}`}
                    className="btn btn-sm btn-primary shadow-sm hover:shadow-luxury hover:scale-[1.02] transition-all"
                  >
                    {t('book')}
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* View all */}
        <div className="mt-10 text-center sm:hidden">
          <Link href="/packages" className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200">
            {t('viewAll')} {isAr ? '←' : '→'}
          </Link>
        </div>
      </div>
    </section>
  )
}

