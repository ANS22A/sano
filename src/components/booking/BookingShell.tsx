'use client'

import { useState, useReducer } from 'react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { BookingProgress } from './BookingProgress'
import { BookingSummary } from './BookingSummary'
import { ExperienceStep } from './steps/ExperienceStep'
import { DateTimeStep } from './steps/DateTimeStep'
import { DetailsStep } from './steps/DetailsStep'
import { ReviewStep } from './steps/ReviewStep'
import { BookingConfirmation } from './confirmation/BookingConfirmation'
import { BOOKING_DRAFT_INITIAL } from '@/data/booking.types'
import { activeLocations } from '@/data/locations.data'
import type { BookingDraft, BookingResult } from '@/data/booking.types'
import type { Service } from '@/data/types'

// ─────────────────────────────────────────────
// State reducer
// ─────────────────────────────────────────────

type Action =
  | { type: 'UPDATE'; patch: Partial<BookingDraft> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: 1 | 2 | 3 | 4 }

function bookingReducer(state: BookingDraft, action: Action): BookingDraft {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, ...action.patch }
    case 'NEXT_STEP': {
      const next = Math.min(4, state.currentStep + 1) as BookingDraft['currentStep']
      return {
        ...state,
        currentStep: next,
        completedSteps: Array.from(new Set([...state.completedSteps, state.currentStep])),
      }
    }
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(1, state.currentStep - 1) as BookingDraft['currentStep'],
      }
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.step }
    default:
      return state
  }
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface BookingShellProps {
  /** Pre-selected service slug from URL ?service= */
  initialServiceSlug?: string | null
  /** Pre-selected package slug from URL ?package= */
  initialPackageSlug?: string | null
  /** Array of all active services from the DB */
  services: Service[]
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function BookingShell({ initialServiceSlug, initialPackageSlug, services }: BookingShellProps) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  // Auto-assign location if only 1 is active — dynamic: adding locations auto-shows the step
  const autoLocationId = activeLocations.length === 1 ? activeLocations[0].id : null

  const [draft, dispatch] = useReducer(bookingReducer, {
    ...BOOKING_DRAFT_INITIAL,
    serviceId: initialServiceSlug ?? null,
    packageSlug: initialPackageSlug ?? null,
    locationId: autoLocationId,
  })

  const [confirmResult, setConfirmResult] = useState<BookingResult | null>(null)

  const update = (patch: Partial<BookingDraft>) => dispatch({ type: 'UPDATE', patch })
  const nextStep = () => dispatch({ type: 'NEXT_STEP' })
  const prevStep = () => dispatch({ type: 'PREV_STEP' })
  const goToStep = (step: 1 | 2 | 3 | 4) => dispatch({ type: 'GO_TO_STEP', step })

  // Confirmation screen (post-booking)
  if (confirmResult) {
    return (
      <div className="container mx-auto px-6 max-w-2xl py-16">
        <BookingConfirmation result={confirmResult} isAr={isAr} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 max-w-6xl py-8">
      {/* Progress stepper */}
      <div className="mb-10">
        <BookingProgress
          currentStep={draft.currentStep}
          completedSteps={draft.completedSteps}
          isAr={isAr}
        />
      </div>

      {/* Content + Sidebar */}
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start',
        isAr && 'lg:grid-cols-[280px_1fr]'
      )}>
        {/* Step content */}
        <div className={cn('min-w-0', isAr ? 'lg:order-2' : 'lg:order-1')}>
          {draft.currentStep === 1 && (
            <ExperienceStep
              draft={draft}
              onUpdate={update}
              onContinue={nextStep}
              isAr={isAr}
              services={services}
            />
          )}
          {draft.currentStep === 2 && (
            <DateTimeStep
              draft={draft}
              onUpdate={update}
              onContinue={nextStep}
              onBack={prevStep}
              isAr={isAr}
            />
          )}
          {draft.currentStep === 3 && (
            <DetailsStep
              draft={draft}
              onUpdate={update}
              onContinue={nextStep}
              onBack={prevStep}
              isAr={isAr}
            />
          )}
          {draft.currentStep === 4 && (
            <ReviewStep
              draft={draft}
              onBack={prevStep}
              onConfirmed={setConfirmResult}
              onGoToStep={(step: 1 | 2 | 3) => goToStep(step)}
              isAr={isAr}
              services={services}
            />
          )}
        </div>

        {/* Sticky summary sidebar */}
        <div className={cn(
          'lg:sticky lg:top-28',
          isAr ? 'lg:order-1' : 'lg:order-2'
        )}>
          <BookingSummary draft={draft} isAr={isAr} services={services} />
        </div>
      </div>
    </div>
  )
}
