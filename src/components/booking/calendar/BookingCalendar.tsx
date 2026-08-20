'use client'

import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

interface BookingCalendarProps {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  isAr: boolean
  /** Minimum selectable date — defaults to today */
  minDate?: string
}

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayISO(): string {
  const t = new Date()
  return toISO(t.getFullYear(), t.getMonth(), t.getDate())
}

export function BookingCalendar({ selectedDate, onSelectDate, isAr, minDate }: BookingCalendarProps) {
  const today = todayISO()
  const min = minDate ?? today

  const [viewYear, setViewYear] = useState(() => {
    const base = selectedDate ?? today
    return parseInt(base.slice(0, 4))
  })
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ?? today
    return parseInt(base.slice(5, 7)) - 1
  })

  const days = isAr ? DAYS_AR : DAYS_EN
  const months = isAr ? MONTHS_AR : MONTHS_EN

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: Array<{ day: number | null; iso: string | null }> = []

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, iso: null })
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, iso: toISO(viewYear, viewMonth, d) })
    }
    // Trailing blanks to complete rows
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, iso: null })
    }
    return cells
  }, [viewYear, viewMonth])

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11 }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0 }
      return m + 1
    })
  }, [])

  const canGoPrev = useMemo(() => {
    const minYear = parseInt(min.slice(0, 4))
    const minMon = parseInt(min.slice(5, 7)) - 1
    return viewYear > minYear || (viewYear === minYear && viewMonth > minMon)
  }, [viewYear, viewMonth, min])

  return (
    <div
      className="select-none"
      dir={isAr ? 'rtl' : 'ltr'}
      role="group"
      aria-label={isAr ? 'التقويم' : 'Calendar'}
    >
      {/* Month navigation */}
      <div className={cn('flex items-center justify-between mb-4', isAr && 'flex-row-reverse')}>
        <button
          onClick={isAr ? nextMonth : prevMonth}
          disabled={isAr ? false : !canGoPrev}
          aria-label={isAr ? 'الشهر التالي' : 'Previous month'}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-colors',
            'hover:bg-background focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
            (!canGoPrev && !isAr) && 'opacity-30 pointer-events-none'
          )}
        >
          {isAr ? '›' : '‹'}
        </button>

        <h3 className="text-sm font-medium text-foreground">
          {months[viewMonth]} {viewYear}
        </h3>

        <button
          onClick={isAr ? prevMonth : nextMonth}
          disabled={isAr ? !canGoPrev : false}
          aria-label={isAr ? 'الشهر السابق' : 'Next month'}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-colors',
            'hover:bg-background focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
            (!canGoPrev && isAr) && 'opacity-30 pointer-events-none'
          )}
        >
          {isAr ? '‹' : '›'}
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-xs text-[var(--color-text-muted)] font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1" role="grid">
        {calendarDays.map((cell, idx) => {
          if (!cell.day || !cell.iso) {
            return <div key={idx} role="gridcell" aria-hidden="true" />
          }

          const isSelected = cell.iso === selectedDate
          const isToday = cell.iso === today
          const isPast = cell.iso < min

          return (
            <div key={idx} role="gridcell">
              <button
                onClick={() => !isPast && onSelectDate(cell.iso!)}
                disabled={isPast}
                aria-label={`${cell.day} ${months[viewMonth]} ${viewYear}${isSelected ? (isAr ? ' — محدد' : ' — selected') : ''}`}
                aria-pressed={isSelected}
                aria-disabled={isPast}
                tabIndex={isPast ? -1 : 0}
                className={cn(
                  'w-full aspect-square flex items-center justify-center rounded-full text-sm',
                  'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
                  isSelected && 'bg-foreground text-white font-semibold',
                  !isSelected && !isPast && isToday && 'ring-1 ring-[var(--color-sand-400)] text-foreground font-medium',
                  !isSelected && !isPast && !isToday && 'hover:bg-background text-foreground',
                  isPast && 'text-[var(--color-text-muted)] opacity-35 cursor-not-allowed'
                )}
              >
                {cell.day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

