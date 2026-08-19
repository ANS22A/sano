'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { homepageFaqs } from '@/data/content.data'

export function FaqSection() {
  const t = useTranslations('home.faq')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section
      ref={ref}
      className="section-sl bg-background border-t border-[var(--border-subtle)]"
      aria-labelledby="faq-heading"
    >
      <div className="container-sl max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <p className="overline-sl mb-3">{t('overline')}</p>
          <h2 id="faq-heading" className="heading-sl-lg mb-4">{t('title')}</h2>
          <p className="text-body-muted">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="divide-y divide-[var(--border-subtle)]"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {homepageFaqs.map((faq) => {
            const isOpen = openId === faq.id
            return (
              <motion.div key={faq.id} variants={staggerItem}>
                <button
                  id={`faq-btn-${faq.id}`}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className={cn(
                    'group w-full flex items-start justify-between gap-4',
                    'py-5 text-start',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                    'rounded-sm'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium leading-snug text-foreground',
                    'group-hover:text-[var(--color-accent)] transition-colors duration-200'
                  )}>
                    {isAr ? faq.question_ar : faq.question_en}
                  </span>
                  <span
                    className={cn(
                      'flex-shrink-0 w-5 h-5 flex items-center justify-center',
                      'text-[var(--color-text-muted)] transition-transform duration-300',
                      isOpen && 'rotate-45'
                    )}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed pb-5">
                        {isAr ? faq.answer_ar : faq.answer_en}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View all */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.4 } } }}
        >
          <Link
            href="/faq"
            className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 justify-center"
          >
            {t('viewAll')} <span aria-hidden="true">{isAr ? '←' : '→'}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
