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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
        {/* Calendar */}
        <div className="bg-[var(--surface)] rounded-sm p-4 border border-[var(--border-subtle)]">
          <BookingCalendar
            selectedDate={draft.date}
            onSelectDate={selectDate}
            isAr={isAr}
          />
        </div>

        {/* Time slots */}
        <div className="w-full lg:w-64">
          {!draft.date ? (
            <div className="h-32 flex items-center justify-center text-sm text-[var(--color-text-muted)] italic">
              {t.selectDate}
            </div>
          ) : isPending ? (
            <div className="h-32 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-5 h-5 border-2 border-accent border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="text-xs text-[var(--color-text-muted)]">{t.loading}</p>
              </div>
            </div>
          ) : !hasSlots ? (
            <div className="flex flex-col gap-1 py-6">
              <p className="text-sm text-foreground font-medium">{t.noSlots}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{t.noSlotsHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {slots.map((slot) => {
                const isSelected = draft.startTime === slot.startTime
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => selectTime(slot)}
                    disabled={!slot.available}
                    aria-pressed={isSelected}
                    className={cn(
                      'px-3 py-2 text-sm rounded-sm border transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
                      isSelected && 'bg-foreground text-white border-foreground',
                      slot.available && !isSelected && 'border-[var(--border-subtle)] hover:border-border hover:bg-[var(--surface)]',
                      !slot.available && 'border-[var(--border-subtle)] text-[var(--color-text-muted)] opacity-40 cursor-not-allowed line-through'
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
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm border border-[var(--border-subtle)] rounded-sm hover:bg-[var(--surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {t.back}
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            'px-8 py-2.5 rounded-sm text-sm tracking-wide transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2',
            canContinue
              ? 'bg-foreground text-white hover:bg-foreground'
              : 'bg-background text-[var(--color-text-muted)] cursor-not-allowed'
          )}
        >
          {t.continue}
        </button>
      </div>
    </div>
  )
}

