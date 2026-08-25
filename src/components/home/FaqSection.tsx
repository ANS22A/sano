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
      className="py-20 lg:py-28 bg-surface-warm border-y border-border-subtle relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Decorative luxury ornament */}
      <div 
        className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="container-sl max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-accent text-xs">✦</span>
            <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
          </div>
          <h2 id="faq-heading" className="heading-sl-lg mb-4">{t('title')}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {homepageFaqs.map((faq) => {
            const isOpen = openId === faq.id
            return (
              <motion.div
                key={faq.id}
                variants={staggerItem}
                className={cn(
                  'rounded-sm bg-background border transition-all duration-300 shadow-subtle',
                  isOpen
                    ? 'border-accent/50 shadow-medium'
                    : 'border-border-subtle hover:border-border hover:shadow-subtle'
                )}
              >
                <button
                  id={`faq-btn-${faq.id}`}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className={cn(
                    'group w-full flex items-center justify-between gap-4 p-5 md:p-6 text-start',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <span className={cn(
                    'text-base font-medium leading-snug transition-colors duration-200',
                    isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'
                  )}>
                    {isAr ? faq.question_ar : faq.question_en}
                  </span>
                  
                  <span
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-light transition-all duration-300',
                      isOpen
                        ? 'bg-primary text-white rotate-45 shadow-sm'
                        : 'bg-surface-muted text-muted-foreground group-hover:bg-accent/20 group-hover:text-foreground'
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
                      <div className="px-5 md:px-6 pb-6 pt-2 border-t border-border-subtle">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {isAr ? faq.answer_ar : faq.answer_en}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View all FAQs link */}
        <div className="text-center mt-12">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-foreground font-medium transition-colors duration-200"
          >
            <span>{t('viewAll')}</span>
            <span aria-hidden="true">{isAr ? '←' : '→'}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
