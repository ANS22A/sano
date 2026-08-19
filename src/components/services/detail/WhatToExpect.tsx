'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/motion/use-reveal'
import { cn } from '@/lib/utils/cn'

interface WhatToExpectProps {
  what_to_expect_ar: string | null
  what_to_expect_en: string | null
}

export function WhatToExpect({ what_to_expect_ar, what_to_expect_en }: WhatToExpectProps) {
  const t = useTranslations('services.detail')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  const content = isAr ? what_to_expect_ar : what_to_expect_en
  if (!content) return null

  return (
    <section
      ref={ref}
      aria-labelledby="what-to-expect-heading"
      className="py-12 border-t border-[var(--border-subtle)]"
    >
      <div className="container-sl">
        <div className="max-w-2xl">
          <motion.h2
            id="what-to-expect-heading"
            className="heading-sl-md mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            {t('whatToExpectTitle')}
          </motion.h2>

          <motion.div
            className={cn(
              'p-6 rounded-sm border border-[var(--border-subtle)]',
              'bg-[var(--color-surface-warm)]'
            )}
            initial={{ opacity: 0, y: 12 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } } }}
          >
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{content}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
