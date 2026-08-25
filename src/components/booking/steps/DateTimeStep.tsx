'use client'

import { useState, useEffect, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import { BookingCalendar } from '@/components/booking/calendar/BookingCalendar'
import { getBookingSlots } from '@/app/actions/booking.actions'
import type { BookingDraft, AvailableSlot } from '@/data/booking.types'

interface DateTimeStepProps {
  draft: BookingDraft
  onUpdate: (patch: Partial<BookingDraft>) => void
  onContinue: () => void
  onBack: () => void
  isAr: boolean
}

function formatDisplayDate(dateStr: string, isAr: boolean): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

export function DateTimeStep({ draft, onUpdate, onContinue, onBack, isAr }: DateTimeStepProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isPending, startTransition] = useTransition()

  const t = {
    title: isAr ? 'اختاري التاريخ والوقت' : 'Choose Your Date & Time',
    loading: isAr ? 'جارٍ تحميل الأوقات المتاحة…' : 'Loading available times…',
    noSlots: isAr ? 'لا توجد أوقات متاحة في هذا التاريخ' : 'No available times on this date',
    noSlotsHint: isAr ? 'يرجى اختيار تاريخ آخر.' : 'Please choose a different date.',
    selectDate: isAr ? 'اختاري تاريخاً أولاً' : 'Select a date first',
    continue: isAr ? 'متابعة' : 'Continue',
    back: isAr ? 'رجوع' : 'Back',
    min: isAr ? 'د' : 'min',
  }

  // Load slots when date changes
  useEffect(() => {
    startTransition(async () => {
      if (!draft.date || !draft.locationId) {
        setSlots([])
        return
      }
      const result = await getBookingSlots(
        draft.serviceId,
        draft.packageSlug,
        draft.locationId!,
        draft.date!
      )
      setSlots(result.slots)
    })
  }, [draft.date, draft.locationId, draft.serviceId, draft.packageSlug])

  const selectDate = (date: string) => {
    onUpdate({ date, startTime: null, endTime: null })
  }

  const selectTime = (slot: AvailableSlot) => {
    if (!slot.available) return
    onUpdate({ startTime: slot.startTime, endTime: slot.endTime })
  }

  const canContinue = !!draft.date && !!draft.startTime

  const availableSlots = slots.filter((s) => s.available)
  const hasSlots = availableSlots.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl text-foreground">{t.title}</h2>
        {draft.date && (
          <p className="text-[var(--color-text-muted)] text-sm">{formatDisplayDate(draft.date, isAr)}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
        {/* Calendar */}
        <div>
          <BookingCalendar
            selectedDate={draft.date}
            onSelectDate={selectDate}
            isAr={isAr}
          />
        </div>

        {/* Time slots */}
        <div className="w-full lg:w-72 p-5 bg-background rounded-sm border border-border-subtle shadow-subtle">
          <h3 className="text-xs uppercase tracking-widest text-accent font-semibold mb-4">
            {isAr ? 'الأوقات المتاحة' : 'Available Time Slots'}
          </h3>

          {!draft.date ? (
            <div className="h-40 flex flex-col items-center justify-center text-sm text-muted-foreground italic gap-2 text-center">
              <span className="text-xl text-accent">◇</span>
              <span>{t.selectDate}</span>
            </div>
          ) : isPending ? (
            <div className="h-40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-accent border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">{t.loading}</p>
              </div>
            </div>
          ) : !hasSlots ? (
            <div className="flex flex-col gap-1 py-8 text-center">
              <p className="text-sm text-foreground font-medium">{t.noSlots}</p>
              <p className="text-xs text-muted-foreground">{t.noSlotsHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pe-1">
              {slots.map((slot) => {
                const isSelected = draft.startTime === slot.startTime
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => selectTime(slot)}
                    disabled={!slot.available}
                    aria-pressed={isSelected}
                    className={cn(
                      'px-3 py-2.5 text-sm rounded-sm border transition-all duration-200 font-mono text-center',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                      isSelected && 'bg-primary text-white border-primary ring-2 ring-accent font-semibold shadow-md scale-[1.02]',
                      slot.available && !isSelected && 'border-border bg-background hover:bg-surface-lavender hover:border-primary text-foreground font-medium',
                      !slot.available && 'border-border-subtle bg-surface-muted text-muted-foreground/30 opacity-40 cursor-not-allowed line-through'
                    )}
                  >
                    {slot.startTime}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onBack}
          className="btn btn-md btn-secondary px-6 py-2.5 border border-border-subtle shadow-sm"
        >
          {t.back}
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            'btn btn-md px-8 py-2.5 font-medium shadow-sm transition-all duration-200',
            canContinue
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

