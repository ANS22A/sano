'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { featuredTestimonials } from '@/data/content.data'

export function TestimonialsSection() {
  const t = useTranslations('home.testimonials')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="section-sl bg-background"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-sl">
        <motion.div
          className="text-center max-w-xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <p className="overline-sl mb-3">{t('overline')}</p>
          <h2 id="testimonials-heading" className="heading-sl-lg mb-4">{t('title')}</h2>
          <p className="text-body-muted">{t('subtitle')}</p>
        </motion.div>

        {/* Placeholder notice */}
        <div className="mb-8 p-3 rounded-sm border border-[var(--color-sand-200)] bg-[var(--color-sand-50,rgba(250,249,247,0.6))] text-center">
          <p className="text-[11px] text-[var(--color-text-muted)] italic">
            {isAr
              ? '⚠ بيانات تطوير — تقييمات حقيقية ستحل محلها قبل الإطلاق'
              : '⚠ Development data — real guest reviews will replace these before launch'}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {featuredTestimonials.map((item) => (
            <motion.blockquote
              key={item.id}
              variants={staggerItem}
              className={cn(
                'group flex flex-col p-6 rounded-sm',
                'border border-[var(--border-subtle)] bg-[var(--color-surface-warm)]',
                'transition-all duration-300',
                'hover:border-[var(--color-sand-400)] hover:shadow-[0_8px_24px_rgba(26,23,20,0.06)]'
              )}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4" aria-label={t('rating')}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-[var(--color-sand-500)] text-xs" aria-hidden="true">★</span>
                ))}
              </div>

              {/* Quote mark */}
              <div
                className="text-[3rem] leading-none text-[var(--color-sand-300)] font-display mb-2 -mt-2"
                aria-hidden="true"
              >
                &ldquo;
              </div>

              {/* Review */}
              <p className="text-sm text-foreground leading-relaxed flex-1 mb-4">
                {isAr ? item.review_ar : item.review_en}
              </p>

              {/* Author */}
              <footer className="border-t border-[var(--border-subtle)] pt-4">
                <div className="flex items-center gap-3">
                  {/* Initial avatar */}
                  <div
                    className="w-8 h-8 rounded-full bg-[var(--color-sand-200)] flex items-center justify-center text-xs font-medium text-[var(--color-sand-700)]"
                    aria-hidden="true"
                  >
                    {item.author_initial}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.author_name}</p>
                    {(isAr ? item.service_name_ar : item.service_name_en) && (
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {isAr ? item.service_name_ar : item.service_name_en}
                      </p>
                    )}
                  </div>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
