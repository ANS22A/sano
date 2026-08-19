'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { featuredTeam } from '@/data/content.data'

export function TeamSection() {
  const t = useTranslations('home.team')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

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
          {featuredTeam.map((member) => (
            <motion.article
              key={member.id}
              variants={staggerItem}
              className={cn(
                'group flex flex-col items-center text-center',
                'p-8 rounded-sm border border-[var(--border-subtle)] bg-background',
                'transition-all duration-300',
                'hover:border-[var(--color-sand-400)] hover:shadow-[0_8px_24px_rgba(26,23,20,0.06)]'
              )}
            >
              {/* Avatar placeholder */}
              <div
                className={cn(
                  'w-24 h-24 rounded-full mb-5 flex-shrink-0',
                  'bg-gradient-to-br from-[var(--color-sand-200)] to-[var(--color-sand-300)]',
                  'flex items-center justify-center',
                  'text-2xl text-[var(--color-sand-600)]'
                )}
                aria-hidden="true"
              >
                ◌
              </div>

              <h3 className="font-medium text-base text-foreground mb-1">
                {isAr ? member.name_ar : member.name_en}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {isAr ? member.title_ar : member.title_en}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap justify-center gap-2">
                {(isAr ? member.specialties_ar : member.specialties_en).map((s) => (
                  <span
                    key={s}
                    className={cn(
                      'px-2.5 py-1 rounded-sm text-[10px]',
                      'bg-[var(--color-sand-100)] text-[var(--color-text-muted)]'
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Placeholder notice */}
              {member.is_placeholder && (
                <p className="mt-4 text-[10px] text-[var(--color-text-muted)] italic opacity-50">
                  {isAr ? 'ملف تعريفي قريباً' : 'Profile coming soon'}
                </p>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
