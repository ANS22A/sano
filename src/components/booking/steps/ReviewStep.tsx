'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import { createBooking } from '@/app/actions/booking.actions'
import { formatAppointmentTime } from '@/lib/utils/format'
import type { BookingDraft, BookingResult } from '@/data/booking.types'
import { packages } from '@/data/content.data'
import { activeLocations } from '@/data/locations.data'
import type { Service } from '@/data/types'

// ─────────────────────────────────────────────
// Row component — declared OUTSIDE ReviewStep
// ─────────────────────────────────────────────

interface RowProps {
  label: string
  value: React.ReactNode
  step?: 1 | 2 | 3
  onGoToStep?: (step: 1 | 2 | 3) => void
  editLabel?: string
  className?: string
}

function ReviewRow({ label, value, step, onGoToStep, editLabel, className }: RowProps) {
  return (
    <div className={cn(
      'flex items-start justify-between gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0',
      className
    )}>
      <dt className="text-sm text-[var(--color-text-muted)] shrink-0">{label}</dt>
      <div className="flex items-start gap-3">
        <dd className="text-sm text-foreground font-medium">{value}</dd>
        {step && onGoToStep && (
          <button
            onClick={() => onGoToStep(step)}
            className="text-xs text-primary hover:text-foreground transition-colors shrink-0 underline underline-offset-2"
          >
            {editLabel ?? 'Edit'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ReviewStep
// ─────────────────────────────────────────────

interface ReviewStepProps {
  draft: BookingDraft
  onBack: () => void
  onConfirmed: (result: BookingResult) => void
  isAr: boolean
  onGoToStep: (step: 1 | 2 | 3) => void
  services: Service[]
}

function formatDate(dateStr: string, isAr: boolean): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

export function ReviewStep({ draft, onBack, onConfirmed, isAr, onGoToStep, services }: ReviewStepProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const service = draft.serviceId ? services.find(s => s.slug === draft.serviceId) : null
  const pkg = draft.packageSlug ? packages.find((p) => p.slug === draft.packageSlug) : null
  const location = activeLocations[0]

  const serviceName = service
    ? (isAr ? service.name_ar : service.name_en)
    : pkg ? (isAr ? pkg.name_ar : pkg.name_en) : '—'

  const price = service
    ? Number(service.price_sar)
    : pkg ? Number(pkg.price_sar) : 0

  const duration = service
    ? service.duration_minutes
    : pkg ? pkg.total_duration_minutes : 0

  const locationName = location ? (isAr ? location.name_ar : location.name_en) : '—'

  const t = {
    title: isAr ? 'راجعي حجزك' : 'Review Your Booking',
    service: isAr ? 'التجربة' : 'Experience',
    dateTime: isAr ? 'التاريخ والوقت' : 'Date & Time',
    location: isAr ? 'الموقع' : 'Location',
    duration: isAr ? 'المدة' : 'Duration',
    price: isAr ? 'السعر' : 'Price',
    details: isAr ? 'بياناتك' : 'Your Details',
    notes: isAr ? 'ملاحظات' : 'Notes',
    edit: isAr ? 'تعديل' : 'Edit',
    confirm: isAr ? 'تأكيد الحجز' : 'Confirm Booking',
    confirming: isAr ? 'جارٍ التأكيد…' : 'Confirming…',
    back: isAr ? 'رجوع' : 'Back',
    min: isAr ? 'دقيقة' : 'min',
    sar: isAr ? 'ريال' : 'SAR',
    disclaimer: isAr
      ? 'بالتأكيد، توافقين على سياسة الحجز والإلغاء.'
      : 'By confirming, you agree to our booking and cancellation policy.',
  }

  const handleConfirm = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const result = await createBooking(draft)
      if (result.success) {
        onConfirmed(result)
      } else {
        setErrorMsg(isAr ? result.messageAr : result.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl text-foreground">{t.title}</h2>
      </div>

      <dl className="bg-background border border-border-subtle rounded-sm px-6 py-2 max-w-lg shadow-subtle">
        <ReviewRow onGoToStep={onGoToStep} editLabel={t.edit} label={t.service} value={serviceName} step={1} />
        <ReviewRow
          onGoToStep={onGoToStep} editLabel={t.edit}
          label={t.dateTime}
          value={draft.date && draft.startTime
            ? `${formatDate(draft.date, isAr)}, ${formatAppointmentTime(draft.startTime, isAr ? 'ar' : 'en')}`
            : '—'}
          step={2}
        />
        <ReviewRow label={t.location} value={locationName} />
        <ReviewRow label={t.duration} value={`${duration} ${t.min}`} />
        <ReviewRow
          onGoToStep={onGoToStep} editLabel={t.edit}
          label={t.details}
          value={
            <span className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">{draft.customer.fullName}</span>
              <span className="text-muted-foreground font-normal text-xs">{draft.customer.phone}</span>
              <span className="text-muted-foreground font-normal text-xs">{draft.customer.email}</span>
            </span>
          }
          step={3}
        />
        {draft.customer.notes && (
          <ReviewRow label={t.notes} value={draft.customer.notes} />
        )}
        <ReviewRow
          label={t.price}
          value={<span className="text-base font-semibold text-primary font-display tabular-nums">{price} <span className="text-xs font-normal text-muted-foreground font-sans">{t.sar}</span></span>}
          className="!border-t-2 !border-border-subtle"
        />
      </dl>

      {/* Error */}
      {errorMsg && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground max-w-lg">
        {t.disclaimer}
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onBack}
          disabled={isPending}
          className="btn btn-md btn-secondary px-6 border border-border-subtle shadow-sm disabled:opacity-50"
        >
          {t.back}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className={cn(
            'btn btn-md btn-primary px-8 shadow-medium hover:shadow-luxury hover:scale-[1.01] transition-all',
            'flex items-center gap-2'
          )}
        >
          {isPending && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
          )}
          {isPending ? t.confirming : t.confirm}
        </button>
      </div>
    </div>
  )
}

