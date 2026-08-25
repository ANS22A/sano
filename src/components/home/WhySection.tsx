'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useReveal } from '@/lib/motion/use-reveal'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { cn } from '@/lib/utils/cn'
import { brandPrinciples } from '@/data/content.data'

export function WhySection() {
  const t = useTranslations('home.why')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { ref, controls } = useReveal()

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-surface-muted border-y border-border-subtle relative overflow-hidden"
      aria-labelledby="why-heading"
    >
      {/* Subtle luxury glow ornament */}
      <div 
        className="absolute -bottom-24 start-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="container-sl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Editorial Lead (5 columns) */}
          <motion.div
            className="lg:col-span-5 flex flex-col justify-between"
            initial={{ opacity: 0, y: 24 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.75 } } }}
          >
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-accent text-xs">✦</span>
                <p className="text-overline text-accent uppercase tracking-widest">{t('overline')}</p>
              </div>
              <h2 id="why-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground font-light leading-tight mb-6">
                {t('title')}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                {t('subtitle')}
              </p>
            </div>

            {/* Editorial quote card */}
            <div className="p-6 md:p-8 rounded-sm bg-background border border-border-strong shadow-subtle relative overflow-hidden">
              <div className="absolute top-0 start-0 w-1 h-full bg-accent" />
              <p className="font-serif italic text-sm text-foreground mb-3 leading-relaxed">
                {isAr
                  ? '«نحن لا نقدّم مجرد خدمات، بل نصنع ملاذاً من السكينة يصل إلى عتبة دارك بأعلى درجات الخصوصية والرقي.»'
                  : '"We deliver not just treatments, but a sanctuary of quiet luxury directly to your home with absolute privacy."'}
              </p>
              <p className="text-xs uppercase tracking-widest text-accent font-medium">
                SANO LUNA · PHILOSOPHY
              </p>
            </div>
          </motion.div>

          {/* 4 Cards Grid (7 columns) */}
          <motion.div
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
          >
            {brandPrinciples.map((principle, i) => (
              <motion.div
                key={principle.id}
                variants={staggerItem}
                className={cn(
                  'group bg-background p-6 md:p-8 rounded-sm',
                  'border border-border-subtle shadow-subtle',
                  'flex flex-col justify-between',
                  'transition-all duration-300',
                  'hover:border-accent/50 hover:shadow-medium hover:-translate-y-1'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono tracking-widest text-accent font-semibold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-primary text-lg group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                      {principle.icon}
                    </span>
                  </div>

                  <h3 className="font-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {isAr ? principle.title_ar : principle.title_en}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isAr ? principle.description_ar : principle.description_en}
                  </p>
                </div>

                <div className="w-6 h-0.5 bg-accent/30 mt-6 group-hover:w-12 group-hover:bg-accent transition-all duration-300 rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

