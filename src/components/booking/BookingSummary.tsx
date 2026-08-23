'use client'

import { cn } from '@/lib/utils/cn'
import type { BookingDraft } from '@/data/booking.types'
import { packages } from '@/data/content.data'
import type { Service } from '@/data/types'

interface BookingSummaryProps {
  draft: BookingDraft
  isAr: boolean
  className?: string
  services: Service[]
}

function formatDate(dateStr: string, isAr: boolean): string {
  try {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return dateStr
  }
}

export function BookingSummary({ draft, isAr, className, services }: BookingSummaryProps) {
  const { serviceId, packageSlug, date, startTime, endTime, durationMinutes, priceSar } = draft

  // Resolve names
  const service = serviceId ? services.find((s) => s.slug === serviceId) : null
  const pkg = packageSlug ? packages.find((p) => p.slug === packageSlug) : null

  const hasSelection = service || pkg
  const name = service
    ? (isAr ? service.name_ar : service.name_en)
    : pkg
    ? (isAr ? pkg.name_ar : pkg.name_en)
    : null

  const price = priceSar
    ?? (service ? Number(service.price_sar) : null)
    ?? (pkg ? Number(pkg.price_sar) : null)

  const duration = durationMinutes
    ?? (service ? service.duration_minutes : null)
    ?? (pkg ? pkg.total_duration_minutes : null)

  const label = (key: string) => {
    const labels: Record<string, [string, string]> = {
      title: ['Your Booking', 'حجزك'],
      experience: ['Experience', 'التجربة'],
      date: ['Date', 'التاريخ'],
      time: ['Time', 'الوقت'],
      duration: ['Duration', 'المدة'],
      price: ['Price', 'السعر'],
      nothing: ['No experience selected yet', 'لم تختاري تجربة بعد'],
      min: ['min', 'دقيقة'],
      sar: ['SAR', 'ريال'],
    }
    return isAr ? (labels[key]?.[1] ?? key) : (labels[key]?.[0] ?? key)
  }

  return (
    <aside className={cn(
      'bg-[var(--surface)] border border-[var(--border-subtle)] rounded-sm p-5',
      className
    )}>
      <h2 className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-medium mb-4">
        {label('title')}
      </h2>

      {!hasSelection ? (
        <p className="text-sm text-[var(--color-text-muted)] italic">
          {label('nothing')}
        </p>
      ) : (
        <dl className="space-y-3">
          {/* Experience */}
          {name && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-[var(--color-text-muted)] shrink-0">{label('experience')}</dt>
              <dd className="text-foreground font-medium text-end">{name}</dd>
            </div>
          )}

          {/* Date */}
          {date && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-[var(--color-text-muted)] shrink-0">{label('date')}</dt>
              <dd className="text-foreground text-end">{formatDate(date, isAr)}</dd>
            </div>
          )}

          {/* Time */}
          {startTime && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-[var(--color-text-muted)] shrink-0">{label('time')}</dt>
              <dd className="text-foreground text-end">{startTime}{endTime && ` — ${endTime}`}</dd>
            </div>
          )}

          {/* Duration */}
          {duration && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-[var(--color-text-muted)] shrink-0">{label('duration')}</dt>
              <dd className="text-foreground text-end">{duration} {label('min')}</dd>
            </div>
          )}

          {/* Price */}
          {price && (
            <div className="flex justify-between gap-3 text-sm pt-3 border-t border-[var(--border-subtle)]">
              <dt className="text-[var(--color-text-muted)] shrink-0">{label('price')}</dt>
              <dd className="text-foreground font-semibold text-base text-end">
                {price} <span className="text-xs font-normal">{label('sar')}</span>
              </dd>
            </div>
          )}
        </dl>
      )}
    </aside>
  )
}
