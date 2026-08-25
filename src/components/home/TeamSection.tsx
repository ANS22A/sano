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
  initialStaff?: DbStaff[] | null
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
      className="section-sl bg-surface-muted border-y border-border-subtle relative overflow-hidden"
      aria-labelledby="team-heading"
    >
      <div className="container-sl">
        <div className="flex items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-accent text-xs">✦</span>
              <p className="overline-sl text-accent uppercase tracking-widest">{t('overline')}</p>
            </div>
            <h2 id="team-heading" className="heading-sl-lg">{t('title')}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } } }}
            className="hidden sm:block flex-shrink-0"
          >
            <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 font-medium">
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

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={controls}
        >
          {initialStaff.map((member) => {
            const name = isAr ? member.name_ar : member.name_en
            const bio = isAr ? member.bio_ar : member.bio_en
            const role = bio || (isAr ? 'أخصائية معتمدة في العناية والسبا المنزلي' : 'Certified Luxury Spa Specialist')
            const initial = name ? name.charAt(0) : 'S'
            
            return (
              <motion.article
                key={member.id}
                variants={staggerItem}
                className={cn(
                  'group flex flex-col items-center text-center',
                  'p-8 rounded-sm border border-border-subtle bg-background shadow-subtle',
                  'transition-all duration-300 relative overflow-hidden',
                  'hover:border-accent/40 hover:shadow-elevated hover:-translate-y-1'
                )}
              >
                {/* Top luxury accent badge */}
                <div className="absolute top-4 end-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                    <span>✦</span> 5.0
                  </span>
                </div>

                {/* Avatar frame */}
                <div
                  className={cn(
                    'w-28 h-28 rounded-full mb-6 flex-shrink-0 relative overflow-hidden',
                    'ring-2 ring-accent/30 p-1 bg-surface-lavender'
                  )}
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-inner">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={name}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white">
                        <span className="font-display text-2xl font-light text-accent">{initial}</span>
                        <span className="text-[10px] text-white/60 tracking-widest uppercase mt-0.5">SANO</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-lg font-medium text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {name}
                </h3>
                
                <p className="text-xs text-accent font-medium uppercase tracking-wider mb-4">
                  {isAr ? 'أخصائية معتمدة' : 'Certified Specialist'}
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                  {role}
                </p>

                {/* Service pills */}
                <div className="mt-auto pt-4 border-t border-border-subtle w-full flex flex-wrap items-center justify-center gap-1.5">
                  <span className="px-2 py-0.5 text-[11px] rounded-sm bg-surface-muted text-muted-foreground">
                    {isAr ? 'مساج استرخائي' : 'Relaxation'}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] rounded-sm bg-surface-muted text-muted-foreground">
                    {isAr ? 'حمام مغربي' : 'Moroccan Bath'}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] rounded-sm bg-surface-muted text-muted-foreground">
                    {isAr ? 'عناية ممتازة' : 'Premium Care'}
                  </span>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

