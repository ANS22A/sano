'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import type { DbStaff } from '@/services/team.service'

interface TeamSectionProps {
  initialStaff: DbStaff[]
}

export function TeamSection({ initialStaff }: TeamSectionProps) {
  const t = useTranslations('home.team')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  if (!initialStaff || initialStaff.length === 0) {
    return null
  }

  return (
    <section
      ref={ref}
      className="section-sl bg-[var(--color-surface-warm)]"
      aria-labelledby="team-heading"
    >
      <div className="container-sl">
        <div className="flex items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <p className="overline-sl mb-3">{t('overline')}</p>
            <h2 id="team-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } } }}
            className="hidden sm:block flex-shrink-0"
          >
            <Link href="/team" className="text-sm text-[var(--color-text-muted)] hover:text-foreground transition-colors duration-200 flex items-center gap-1.5">
              {t('viewAll')} <span aria-hidden="true">{isAr ? '←' : '→'}</span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="text-body-muted max-w-xl mb-12"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{ visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1 } } }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {initialStaff.map((member) => {
            const name = isAr ? member.name_ar : member.name_en
            const bio = isAr ? member.bio_ar : member.bio_en
            
            return (
              <motion.article
                key={member.id}
                variants={staggerItem}
                className={cn(
                  'group flex flex-col items-center text-center',
                  'p-8 rounded-sm border border-[var(--border-subtle)] bg-background',
                  'transition-all duration-300',
                  'hover:border-border hover:shadow-[0_8px_24px_rgba(26,23,20,0.06)]'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-24 h-24 rounded-full mb-5 flex-shrink-0 relative overflow-hidden',
                    'bg-gradient-to-br from-surface to-accent'
                  )}
                  aria-hidden="true"
                >
                  {member.image_url ? (
                    <Image
                      src={member.image_url}
                      alt={name}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl text-primary">◌</span>
                    </div>
                  )}
                </div>

                <h3 className="font-medium text-base text-foreground mb-2">
                  {name}
                </h3>
                {bio && (
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
                    {bio}
                  </p>
                )}
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

