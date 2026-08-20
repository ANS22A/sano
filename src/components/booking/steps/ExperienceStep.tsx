'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { activeServices } from '@/data/services.data'
import { packages } from '@/data/content.data'
import type { BookingDraft } from '@/data/booking.types'

interface ExperienceStepProps {
  draft: BookingDraft
  onUpdate: (patch: Partial<BookingDraft>) => void
  onContinue: () => void
  isAr: boolean
}

type Tab = 'services' | 'packages'

export function ExperienceStep({ draft, onUpdate, onContinue, isAr }: ExperienceStepProps) {
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
      <div className={cn('flex flex-col gap-1', isAr && 'items-end')}>
        <h2 className="font-serif text-2xl text-foreground">{t.title}</h2>
        <p className="text-[var(--color-text-muted)] text-sm">{t.subtitle}</p>
      </div>

      {/* Tab switcher */}
      <div className={cn('flex gap-1 p-1 bg-background rounded-sm w-fit', isAr && 'flex-row-reverse')}>
        {(['services', 'packages'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'px-4 py-1.5 text-sm rounded-sm transition-colors',
              tab === tabKey
                ? 'bg-white text-foreground shadow-sm font-medium'
                : 'text-[var(--color-text-muted)] hover:text-foreground'
            )}
          >
            {tabKey === 'services' ? t.services : t.packages}
          </button>
        ))}
      </div>

      {/* Service list */}
      {tab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {activeServices.map((service) => {
            const isSelected = draft.serviceId === service.id
            const name = isAr ? service.name_ar : service.name_en
            const shortDesc = isAr ? service.short_description_ar : service.short_description_en

            return (
              <button
                key={service.id}
                onClick={() => selectService(service.id)}
                aria-pressed={isSelected}
                className={cn(
                  'text-start p-4 border rounded-sm transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
                  isSelected
                    ? 'border-foreground bg-[var(--color-sand-50)] ring-1 ring-[var(--color-sand-200)]'
                    : 'border-[var(--border-subtle)] hover:border-accent hover:bg-[var(--color-sand-50)]',
                  isAr && 'text-right'
                )}
              >
                <div className={cn('flex items-start justify-between gap-2', isAr && 'flex-row-reverse')}>
                  <span className="font-medium text-sm text-foreground leading-snug">{name}</span>
                  {isSelected && (
                    <span className="text-[10px] text-primary bg-background px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                      {t.selected}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                  {shortDesc}
                </p>
                <div className={cn('flex items-center gap-3 mt-2 text-xs text-primary', isAr && 'flex-row-reverse')}>
                  <span>{service.duration_minutes} {t.min}</span>
                  <span className="text-[var(--border-subtle)]">·</span>
                  <span className="font-medium">{Number(service.price_sar)} {t.sar}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Package list */}
      {tab === 'packages' && (
        <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {packages.filter((p) => p.is_active).map((pkg) => {
            const isSelected = draft.packageSlug === pkg.slug
            const name = isAr ? pkg.name_ar : pkg.name_en
            const tagline = isAr ? (pkg.tagline_ar ?? '') : (pkg.tagline_en ?? '')
            const desc = isAr ? pkg.description_ar : pkg.description_en

            return (
              <button
                key={pkg.id}
                onClick={() => selectPackage(pkg.slug)}
                aria-pressed={isSelected}
                className={cn(
                  'text-start p-4 border rounded-sm transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
                  isSelected
                    ? 'border-foreground bg-[var(--color-sand-50)] ring-1 ring-[var(--color-sand-200)]'
                    : 'border-[var(--border-subtle)] hover:border-accent hover:bg-[var(--color-sand-50)]',
                  isAr && 'text-right'
                )}
              >
                <div className={cn('flex items-start justify-between gap-2', isAr && 'flex-row-reverse')}>
                  <div>
                    {tagline && <p className="text-[10px] text-primary tracking-widest uppercase mb-0.5">{tagline}</p>}
                    <span className="font-medium text-sm text-foreground">{name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-primary bg-background px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                      {t.selected}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">{desc}</p>
                <div className={cn('flex items-center gap-3 mt-2 text-xs text-primary', isAr && 'flex-row-reverse')}>
                  <span>{pkg.total_duration_minutes} {t.min}</span>
                  <span>·</span>
                  <span className="font-medium">{pkg.price_sar} {t.sar}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Continue */}
      <button
        onClick={onContinue}
        disabled={!hasSelection}
        className={cn(
          'mt-2 self-end px-8 py-3 rounded-sm text-sm tracking-wide transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2',
          hasSelection
            ? 'bg-foreground text-white hover:bg-foreground'
            : 'bg-background text-[var(--color-text-muted)] cursor-not-allowed'
        )}
      >
        {t.continue}
      </button>
    </div>
  )
}

