'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { packages } from '@/data/content.data'
import type { BookingDraft } from '@/data/booking.types'
import type { Service } from '@/data/types'

interface ExperienceStepProps {
  draft: BookingDraft
  onUpdate: (patch: Partial<BookingDraft>) => void
  onContinue: () => void
  isAr: boolean
  services: Service[]
}

type Tab = 'services' | 'packages'

export function ExperienceStep({ draft, onUpdate, onContinue, isAr, services }: ExperienceStepProps) {
  const [tab, setTab] = useState<Tab>(() => {
    if (draft.packageSlug) return 'packages'
    return 'services'
  })

  const hasSelection = draft.serviceId || draft.packageSlug

  const selectService = (id: string) => {
    onUpdate({ serviceId: id, packageSlug: null, durationMinutes: null, priceSar: null })
  }

  const selectPackage = (slug: string) => {
    onUpdate({ packageSlug: slug, serviceId: null, durationMinutes: null, priceSar: null })
  }

  const t = {
    title: isAr ? 'اختاري تجربتك' : 'Choose Your Experience',
    subtitle: isAr ? 'اختاري خدمة أو باقة للبدء' : 'Select a service or package to begin',
    services: isAr ? 'الخدمات' : 'Services',
    packages: isAr ? 'الباقات' : 'Packages',
    selected: isAr ? 'تم الاختيار ✓' : 'Selected ✓',
    select: isAr ? 'اختيار' : 'Select',
    continue: isAr ? 'متابعة' : 'Continue',
    min: isAr ? 'د' : 'min',
    sar: isAr ? 'ريال' : 'SAR',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl text-foreground">{t.title}</h2>
        <p className="text-[var(--color-text-muted)] text-sm">{t.subtitle}</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1.5 bg-surface-muted rounded-sm border border-border-subtle w-fit">
        {(['services', 'packages'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'px-6 py-2 text-sm rounded-sm transition-all duration-200 font-medium',
              tab === tabKey
                ? 'bg-primary text-white shadow-sm ring-1 ring-accent/40'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tabKey === 'services' ? t.services : t.packages}
          </button>
        ))}
      </div>

      {/* Service list */}
      {tab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pe-1">
          {services.map((service) => {
            const isSelected = draft.serviceId === service.id
            const name = isAr ? service.name_ar : service.name_en
            const shortDesc = isAr ? service.short_description_ar : service.short_description_en

            return (
              <button
                key={service.id}
                onClick={() => selectService(service.id)}
                aria-pressed={isSelected}
                className={cn(
                  'text-start p-5 border rounded-sm transition-all duration-200 flex flex-col justify-between',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  isSelected
                    ? 'border-primary bg-surface-lavender ring-2 ring-accent/60 shadow-medium'
                    : 'border-border-subtle bg-background hover:border-accent/50 hover:bg-surface-warm shadow-subtle'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-display font-medium text-base text-foreground leading-snug">{name}</span>
                    {isSelected ? (
                      <span className="text-[10px] text-white bg-primary font-semibold px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap border border-accent/40 shadow-xs">
                        {t.selected}
                      </span>
                    ) : (
                      <span className="text-xs text-accent opacity-60">✦</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {shortDesc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                  <span className="font-display font-medium text-foreground text-sm">
                    {service.price_sar} <span className="text-[11px] text-muted-foreground font-sans">{t.sar}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {service.duration_minutes} {t.min}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Package list */}
      {tab === 'packages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pe-1">
          {packages.filter((p) => p.is_active).map((pkg) => {
            const isSelected = draft.packageSlug === pkg.slug
            const name = isAr ? pkg.name_ar : pkg.name_en
            const tagline = isAr ? pkg.tagline_ar : pkg.tagline_en
            const desc = isAr ? pkg.description_ar : pkg.description_en

            return (
              <button
                key={pkg.id}
                onClick={() => selectPackage(pkg.slug)}
                aria-pressed={isSelected}
                className={cn(
                  'text-start p-5 border rounded-sm transition-all duration-200 flex flex-col justify-between',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  isSelected
                    ? 'border-primary bg-surface-lavender ring-2 ring-accent/60 shadow-medium'
                    : 'border-border-subtle bg-background hover:border-accent/50 hover:bg-surface-warm shadow-subtle'
                )}
              >
                <div>
                  {tagline && (
                    <p className="text-[10px] text-accent uppercase tracking-widest font-semibold mb-1">
                      {tagline}
                    </p>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-display font-medium text-base text-foreground leading-snug">{name}</span>
                    {isSelected ? (
                      <span className="text-[10px] text-white bg-primary font-semibold px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap border border-accent/40 shadow-xs">
                        {t.selected}
                      </span>
                    ) : (
                      <span className="text-xs text-accent opacity-60">✦</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                  <span className="font-display font-medium text-foreground text-sm">
                    {pkg.price_sar} <span className="text-[11px] text-muted-foreground font-sans">{t.sar}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {pkg.total_duration_minutes} {t.min}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Continue CTA */}
      <div className="pt-2">
        <button
          onClick={onContinue}
          disabled={!hasSelection}
          className={cn(
            'btn btn-md px-8 py-2.5 font-medium shadow-sm transition-all duration-200',
            hasSelection
              ? 'btn-primary shadow-medium hover:shadow-luxury hover:scale-[1.01]'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          )}
        >
          {t.continue}
        </button>
      </div>
    </div>
  )
}

