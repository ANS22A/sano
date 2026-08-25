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
      <ol className="hidden md:flex items-center justify-center gap-0">
        {BOOKING_STEPS.map((step, idx) => {
          const isActive = currentStep === step.id
          const isPast = step.id < currentStep

          return (
            <li key={step.id} className={cn('flex items-center', idx < BOOKING_STEPS.length - 1 && 'flex-1')}>
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shadow-subtle',
                  isActive && 'bg-primary text-white ring-4 ring-accent/30 scale-110 shadow-medium',
                  isPast && 'bg-accent text-foreground font-bold',
                  !isActive && !isPast && 'bg-background text-muted-foreground border border-border-subtle'
                )}>
                  {isPast ? (
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="tabular-nums font-mono">{String(step.id).padStart(2, '0')}</span>
                  )}
                </div>
                <span className={cn(
                  'text-xs text-center whitespace-nowrap transition-colors tracking-wide',
                  isActive ? 'text-primary font-bold' : isPast ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {isAr ? step.labelAr : step.labelEn}
                </span>
              </div>

              {/* Connector line */}
              {idx < BOOKING_STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-3 mb-6 transition-colors duration-300 rounded-full',
                  completedSteps.includes(step.id) ? 'bg-accent' : 'bg-border-subtle'
                )} />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: compact — dots + current step label */}
      <div className="flex md:hidden items-center justify-between px-2 py-2 bg-background rounded-sm border border-border-subtle shadow-subtle">
        <div className="flex items-center gap-2">
          {BOOKING_STEPS.map((step) => {
            const isActive = currentStep === step.id
            const isPast = step.id < currentStep
            return (
              <div
                key={step.id}
                className={cn(
                  'rounded-full transition-all duration-300',
                  isActive ? 'w-6 h-2.5 bg-primary ring-2 ring-accent/30' : '',
                  isPast ? 'w-2.5 h-2.5 bg-accent' : '',
                  !isActive && !isPast ? 'w-2.5 h-2.5 bg-border-subtle' : ''
                )}
                aria-hidden="true"
              />
            )
          })}
        </div>
        <span className="text-xs text-muted-foreground">
          {currentStep}/{BOOKING_STEPS.length} —{' '}
          <span className="font-semibold text-primary">
            {isAr
              ? BOOKING_STEPS[currentStep - 1]?.labelAr
              : BOOKING_STEPS[currentStep - 1]?.labelEn}
          </span>
        </span>
      </div>
    </nav>
  )
}

