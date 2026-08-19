'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'

// Gallery placeholder items — replace with real Supabase gallery_items
const galleryPlaceholders = [
  { id: 'g1', aspect: 'tall', label_ar: 'أجواء الاسترخاء', label_en: 'Relaxation Atmosphere' },
  { id: 'g2', aspect: 'wide', label_ar: 'أدوات العناية', label_en: 'Care Essentials' },
  { id: 'g3', aspect: 'square', label_ar: 'الدفء والهدوء', label_en: 'Warmth & Calm' },
  { id: 'g4', aspect: 'square', label_ar: 'الحمام المغربي', label_en: 'Moroccan Ritual' },
  { id: 'g5', aspect: 'tall', label_ar: 'لحظة التجديد', label_en: 'A Moment of Renewal' },
  { id: 'g6', aspect: 'wide', label_ar: 'فن العناية', label_en: 'The Art of Care' },
] as const

export function GallerySection() {
  const t = useTranslations('home.gallery')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="section-sl bg-[var(--color-surface-warm)]"
      aria-labelledby="gallery-heading"
    >
      <div className="container-sl">
        <div className="flex items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <p className="overline-sl mb-3">{t('overline')}</p>
            <h2 id="gallery-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } } }}
            className="hidden sm:block flex-shrink-0"
          >
            <Link href="/gallery" className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200 flex items-center gap-1.5">
              {t('viewAll')} <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="text-body-muted max-w-xl mb-10"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{ visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Placeholder notice */}
        <div className="mb-8 p-3 rounded-sm border border-[var(--color-sand-200)] bg-[var(--color-sand-50,rgba(250,249,247,0.6))] text-center">
          <p className="text-[11px] text-[var(--color-text-muted)] italic">
            {isAr
              ? '⚠ صور افتراضية — سيتم استبدالها بصور حقيقية قبل الإطلاق'
              : '⚠ Placeholder layout — real photography will replace these before launch'}
          </p>
        </div>

        {/* Masonry-style grid */}
        <motion.div
          className={cn(
            'grid gap-3',
            'grid-cols-2 md:grid-cols-3',
            'auto-rows-[200px]'
          )}
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {galleryPlaceholders.map((item, i) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              className={cn(
                'relative overflow-hidden rounded-sm',
                'bg-gradient-to-br',
                i % 3 === 0 && 'from-[var(--color-sand-200)] to-[var(--color-sand-300)]',
                i % 3 === 1 && 'from-[var(--color-sand-100)] to-[var(--color-sand-200)]',
                i % 3 === 2 && 'from-[var(--color-sand-300)] to-[var(--color-sand-400)]',
                item.aspect === 'tall' && 'row-span-2',
                item.aspect === 'wide' && 'md:col-span-2',
              )}
            >
              {/* Label overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl text-[var(--color-sand-500)] opacity-30 font-display" aria-hidden="true">✦</span>
                <span className="text-[10px] text-[var(--color-sand-600)] mt-2 opacity-60 tracking-wider">
                  {isAr ? item.label_ar : item.label_en}
                </span>
              </div>

              {/* Hover overlay */}
              <div className={cn(
                'absolute inset-0 bg-black/0 transition-all duration-350',
                'group-hover:bg-black/20'
              )} aria-hidden="true" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
