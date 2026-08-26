'use client'

import { cn } from '@/lib/utils/cn'
import { formatAppointmentTime } from '@/lib/utils/format'
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
      'bg-background border border-border-subtle rounded-sm p-6 shadow-subtle relative overflow-hidden',
      className
    )}>
      {/* Top brand gradient line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="flex items-center gap-2 mb-5">
        <span className="text-accent text-xs">✦</span>
        <h2 className="text-xs tracking-[0.2em] uppercase text-accent font-semibold">
          {label('title')}
        </h2>
      </div>

      {!hasSelection ? (
        <div className="py-6 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-2">
          <span className="text-xl text-accent/40">◌</span>
          <span>{label('nothing')}</span>
        </div>
      ) : (
        <dl className="space-y-3.5">
          {/* Experience */}
          {name && (
            <div className="flex justify-between gap-3 text-sm pb-3 border-b border-border-subtle">
              <dt className="text-muted-foreground shrink-0">{label('experience')}</dt>
              <dd className="text-primary font-display font-medium text-end">{name}</dd>
            </div>
          )}

          {/* Date */}
          {date && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-muted-foreground shrink-0">{label('date')}</dt>
              <dd className="text-foreground font-medium text-end">{formatDate(date, isAr)}</dd>
            </div>
          )}

          {/* Time */}
          {startTime && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-muted-foreground shrink-0">{label('time')}</dt>
              <dd className="text-foreground font-mono font-medium text-end">{formatAppointmentTime(startTime, isAr ? 'ar' : 'en')}{endTime && ` — ${formatAppointmentTime(endTime, isAr ? 'ar' : 'en')}`}</dd>
            </div>
          )}

          {/* Duration */}
          {duration && (
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-muted-foreground shrink-0">{label('duration')}</dt>
              <dd className="text-foreground text-end">{duration} {label('min')}</dd>
            </div>
          )}

          {/* Price Box */}
          {price && (
            <div className="mt-4 p-4 rounded-sm bg-surface-warm border border-border-subtle flex justify-between items-center">
              <dt className="text-sm font-medium text-foreground">{label('price')}</dt>
              <dd className="text-xl font-light font-display text-primary tabular-nums">
                {price} <span className="text-xs text-muted-foreground font-sans">{label('sar')}</span>
              </dd>
            </div>
          )}
        </dl>
      )}
    </aside>
  )
}
