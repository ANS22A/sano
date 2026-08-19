'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/motion/use-reveal'

interface ServiceDescriptionProps {
  description_ar: string
  description_en: string
}

export function ServiceDescription({ description_ar, description_en }: ServiceDescriptionProps) {
  const t = useTranslations('services.detail')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  const description = isAr ? description_ar : description_en
  // Split on double newline for paragraphs
  const paragraphs = description.split('\n\n').filter(Boolean)

  return (
    <section ref={ref} aria-labelledby="description-heading" className="py-14">
      <div className="container-sl">
        <div className="max-w-2xl">
          <motion.h2
            id="description-heading"
            className="heading-sl-md mb-7"
            initial={{ opacity: 0, y: 16 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            {t('descriptionTitle')}
          </motion.h2>

          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <motion.p
                key={i}
                className="text-[var(--color-text-muted)] leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, delay: 0.1 + i * 0.1 },
                  },
                }}
              >
                {para}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
