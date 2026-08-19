'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/motion/use-reveal'
import { ServiceCard } from '@/components/services/ServiceCard'
import type { Service, ServiceCategory } from '@/data/types'

interface RelatedServicesProps {
  services: Service[]
  categories: ServiceCategory[]
}

export function RelatedServices({ services, categories }: RelatedServicesProps) {
  const t = useTranslations('services.detail')
  const { ref, controls } = useReveal()

  if (!services || services.length === 0) return null

  const catMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <section
      ref={ref}
      aria-labelledby="related-heading"
      className="py-14 border-t border-[var(--border-subtle)]"
    >
      <div className="container-sl">
        <motion.h2
          id="related-heading"
          className="heading-sl-md mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
        >
          {t('relatedTitle')}
        </motion.h2>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              category={catMap.get(service.category_id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
