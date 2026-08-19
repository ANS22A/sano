'use client'

import { cn } from '@/lib/utils/cn'
import { BOOKING_STEPS } from '@/data/booking.types'
import type { BookingDraft } from '@/data/booking.types'

interface BookingProgressProps {
  currentStep: BookingDraft['currentStep']
  completedSteps: number[]
  isAr: boolean
}

export function BookingProgress({ currentStep, completedSteps, isAr }: BookingProgressProps) {
  return (
    <nav aria-label={isAr ? 'خطوات الحجز' : 'Booking steps'} className="w-full">
      {/* Desktop: horizontal stepper */}
      <ol className={cn(
        'hidden md:flex items-center justify-center gap-0',
        isAr && 'flex-row-reverse'
      )}>
        {BOOKING_STEPS.map((step, idx) => {
          const isActive = currentStep === step.id
          const isPast = step.id < currentStep

          return (
            <li key={step.id} className={cn('flex items-center', idx < BOOKING_STEPS.length - 1 && 'flex-1')}>
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  isActive && 'bg-[var(--color-sand-900)] text-white ring-4 ring-[var(--color-sand-200)]',
                  isPast && 'bg-[var(--color-sand-700)] text-white',
                  !isActive && !isPast && 'bg-[var(--color-sand-100)] text-[var(--color-sand-400)] border border-[var(--border-subtle)]'
                )}>
                  {isPast ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="tabular-nums">{String(step.id).padStart(2, '0')}</span>
                  )}
                </div>
                <span className={cn(
                  'text-xs text-center whitespace-nowrap transition-colors',
                  isActive ? 'text-[var(--color-sand-900)] font-medium' : 'text-[var(--color-text-muted)]'
                )}>
                  {isAr ? step.labelAr : step.labelEn}
                </span>
              </div>

              {/* Connector line */}
              {idx < BOOKING_STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-px mx-3 mb-5 transition-colors duration-300',
                  completedSteps.includes(step.id) ? 'bg-[var(--color-sand-700)]' : 'bg-[var(--border-subtle)]'
                )} />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: compact — dots + current step label */}
      <div className="flex md:hidden items-center justify-between px-1">
        <div className={cn('flex items-center gap-1.5', isAr && 'flex-row-reverse')}>
          {BOOKING_STEPS.map((step) => {
            const isActive = currentStep === step.id
            const isPast = step.id < currentStep
            return (
              <div
                key={step.id}
                className={cn(
                  'rounded-full transition-all duration-300',
                  isActive ? 'w-6 h-2 bg-[var(--color-sand-900)]' : '',
                  isPast ? 'w-2 h-2 bg-[var(--color-sand-600)]' : '',
                  !isActive && !isPast ? 'w-2 h-2 bg-[var(--color-sand-200)]' : ''
                )}
                aria-hidden="true"
              />
            )
          })}
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {currentStep}/{BOOKING_STEPS.length} —{' '}
          <span className="font-medium text-foreground">
            {isAr
              ? BOOKING_STEPS[currentStep - 1]?.labelAr
              : BOOKING_STEPS[currentStep - 1]?.labelEn}
          </span>
        </span>
      </div>
    </nav>
  )
}
