'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CalendarBooking {
  id: string
  booking_number: string
  date: string
  start_time: string
  end_time: string
  status: string
  customer_name: string
  service_name: string
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
  completed: 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  no_show:   'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function AdminCalendar({ initialBookings, currentMonth }: { initialBookings: CalendarBooking[], currentMonth: string }) {
  // currentMonth is YYYY-MM
  const [year, monthNum] = currentMonth.split('-').map(Number)
  const monthIdx = monthNum - 1
  
  const daysInMonth = getDaysInMonth(year, monthIdx)
  const firstDay = getFirstDayOfMonth(year, monthIdx)

  const blanks = Array.from({ length: firstDay })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthName = new Date(year, monthIdx).toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = monthIdx === 0 ? `${year - 1}-12` : `${year}-${String(monthIdx).padStart(2, '0')}`
  const nextMonth = monthIdx === 11 ? `${year + 1}-01` : `${year}-${String(monthIdx + 2).padStart(2, '0')}`

  return (
    <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8de] bg-[#faf7f4] shrink-0">
        <h2 className="text-lg font-bold text-[#2a2118]">{monthName}</h2>
        <div className="flex gap-2">
          <Link href={`/admin/calendar?month=${prevMonth}`} className="p-1.5 rounded-lg border border-[#e8ddd0] text-[#7a6a57] hover:bg-[#f5ede0] transition-colors" aria-label="Previous month">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <Link href={`/admin/calendar?month=${nextMonth}`} className="p-1.5 rounded-lg border border-[#e8ddd0] text-[#7a6a57] hover:bg-[#f5ede0] transition-colors" aria-label="Next month">
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 min-w-[800px] h-full border-s border-[#f0e8de]">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="px-2 py-3 border-b border-e border-[#f0e8de] text-center text-xs font-semibold text-[#9a8a7a] uppercase tracking-wide bg-white sticky top-0 z-10">
              {d}
            </div>
          ))}

          {/* Blanks */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="border-b border-e border-[#f0e8de] bg-[#faf7f4]/50 min-h-[120px]" />
          ))}

          {/* Days */}
          {days.map((day) => {
            const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayBookings = initialBookings.filter(b => b.date === dateStr)

            return (
              <div key={day} className="border-b border-e border-[#f0e8de] min-h-[120px] p-1.5 bg-white flex flex-col group">
                <span className="text-xs font-medium text-[#7a6a57] ps-1 pt-1 mb-2 group-hover:text-[#2a2118] transition-colors">
                  {day}
                </span>
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] pe-1 styled-scrollbar">
                  {dayBookings.map(b => (
                    <Link
                      key={b.id}
                      href={`/admin/bookings/${b.id}`}
                      className={cn(
                        'block px-2 py-1 rounded text-[10px] leading-tight border transition-colors truncate',
                        STATUS_COLORS[b.status] ?? STATUS_COLORS.pending
                      )}
                      title={`${b.start_time.slice(0,5)} ${b.customer_name} - ${b.service_name}`}
                    >
                      <span className="font-semibold">{b.start_time.slice(0,5)}</span> {b.customer_name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
