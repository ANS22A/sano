'use client'

import { useState, useTransition, useEffect } from 'react'
import { updateBookingStatus, rescheduleBooking } from '@/app/actions/adminBookings.actions'
import { getBookingSlots } from '@/app/actions/booking.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { ArrowLeft, User, Phone, Mail, FileText, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import type { AvailableSlot } from '@/data/booking.types'

interface BookingDetailClientProps {
  booking: {
    id: string
    booking_number: string
    date: string
    start_time: string
    end_time: string
    status: string
    price_sar: number
    notes: string
    created_at: string
    service_id: string | null
    package_slug: string | null
    location_id: string
    customers: { id: string, full_name: string; phone: string; email: string } | null
    services: { name_en: string; name_ar: string } | null
    locations: { name_en: string; name_ar: string; address_en: string } | null
  }
}

type PendingAction = 'confirmed' | 'cancelled' | 'completed' | 'no_show' | null

export function BookingDetailClient({ booking }: BookingDetailClientProps) {
  const { t, lang } = useAdmin()
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(booking.status)

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState(booking.date)
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailableSlot[]>([])
  const [rescheduleSlot, setRescheduleSlot] = useState('')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [rescheduleError, setRescheduleError] = useState('')

  function doAction(status: PendingAction) {
    if (!status) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('bookingId', booking.id)
      fd.set('status', status)
      if (status === 'cancelled') {
        fd.set('cancellationReason', cancellationReason)
      }
      const result = await updateBookingStatus(fd)
      if (!result?.error) {
        setCurrentStatus(status)
      }
      setPendingAction(null)
      setCancellationReason('')
    })
  }

  // Fetch slots when date changes
  useEffect(() => {
    if (!isRescheduling) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingSlots(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRescheduleError('')
    getBookingSlots(booking.service_id, booking.package_slug, booking.location_id, rescheduleDate)
      .then((res) => {
        if (active) {
          setRescheduleSlots(res.slots)
          setRescheduleSlot('')
        }
      })
      .catch(() => {
        if (active) setRescheduleError('Failed to load slots')
      })
      .finally(() => {
        if (active) setIsLoadingSlots(false)
      })
    return () => { active = false }
  }, [rescheduleDate, isRescheduling, booking.service_id, booking.package_slug, booking.location_id])

  function doReschedule() {
    if (!rescheduleSlot) return
    startTransition(async () => {
      setRescheduleError('')
      const fd = new FormData()
      fd.set('bookingId', booking.id)
      fd.set('date', rescheduleDate)
      fd.set('startTime', rescheduleSlot)
      
      const result = await rescheduleBooking(fd)
      if (result?.error) {
        setRescheduleError(result.error)
      } else {
        setIsRescheduling(false)
      }
    })
  }

  const svc = booking.services
  const cust = booking.customers

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-[#9a8a7a] hover:text-[#2a2118] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t.common.back}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2a2118] font-mono">{booking.booking_number}</h1>
          <p className="text-sm text-[#9a8a7a]">Created {new Date(booking.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3 items-center">
          <AdminBadge status={currentStatus} label={t.status[currentStatus as keyof typeof t.status] ?? currentStatus} size="md" />
          
          {['pending', 'confirmed'].includes(currentStatus) && (
            <button
              onClick={() => setIsRescheduling(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e8ddd0] bg-white text-[#2a2118] hover:bg-[#f5ede0] transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-[#c9a96e]" />
              Reschedule
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Booking Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f0e8de] bg-[#faf7f4]">
              <h2 className="text-sm font-semibold text-[#2a2118]">Booking Information</h2>
            </div>
            <dl className="divide-y divide-[#f0e8de]">
              {[
                [lang === 'ar' && svc ? svc.name_ar : svc?.name_en ?? '—', t.bookings.service],
                [booking.date, t.bookings.date],
                [`${booking.start_time.slice(0,5)} → ${booking.end_time.slice(0,5)}`, t.bookings.time],
                [booking.locations ? (lang === 'ar' ? booking.locations.name_ar : booking.locations.name_en) : '—', t.bookings.location ?? 'Location'],
                [`${booking.price_sar} ${t.common.sar}`, t.bookings.price],
              ].map(([value, label]) => (
                <div key={label} className="flex px-6 py-3.5 gap-4">
                  <dt className="text-xs font-medium text-[#9a8a7a] w-32 shrink-0 flex items-center">{label}</dt>
                  <dd className="text-sm text-[#2a2118] flex-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
             <div className="px-6 py-4 border-b border-[#f0e8de] bg-[#faf7f4]">
               <h2 className="text-sm font-semibold text-[#2a2118]">Customer Notes</h2>
             </div>
             <div className="p-6">
               <p className="text-sm text-[#7a6a57] whitespace-pre-wrap leading-relaxed">{booking.notes || 'No notes provided.'}</p>
             </div>
          </div>
        </div>

        {/* Right Col: Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#2a2118]">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f5ede0] flex items-center justify-center text-[#c9a96e]">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2a2118] truncate">
                    {cust?.full_name ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#7a6a57]">
                <Phone className="w-4 h-4 shrink-0 text-[#9a8a7a]" />
                <span dir="ltr">{cust?.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#7a6a57]">
                <Mail className="w-4 h-4 shrink-0 text-[#9a8a7a]" />
                <span className="truncate">{cust?.email ?? '—'}</span>
              </div>
              {cust?.id && (
                <Link
                  href={`/admin/customers/${cust.id}`}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-[#c9a96e] hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View History
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#2a2118]">Status Actions</h2>
            <div className="flex flex-col gap-2">
              {currentStatus === 'pending' && (
                <button
                  onClick={() => setPendingAction('confirmed')}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  {t.bookings.confirm}
                </button>
              )}
              {currentStatus === 'confirmed' && (
                <>
                  <button
                    onClick={() => setPendingAction('completed')}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    {t.bookings.complete}
                  </button>
                  <button
                    onClick={() => setPendingAction('no_show')}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-slate-600 text-white hover:bg-slate-700 transition-colors"
                  >
                    {t.bookings.noShow}
                  </button>
                </>
              )}
              {['pending', 'confirmed'].includes(currentStatus) && (
                <button
                  onClick={() => setPendingAction('cancelled')}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                  {t.bookings.cancel}
                </button>
              )}
              {['cancelled', 'completed', 'no_show'].includes(currentStatus) && (
                <p className="text-xs text-[#9a8a7a] text-center">No further status actions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Action Dialog */}
      {pendingAction === 'cancelled' ? (
        <ConfirmDialog
          open={true}
          title={t.bookings.confirmCancel}
          description={t.bookings.confirmCancelDesc}
          confirmLabel={isPending ? '…' : t.common.confirm}
          cancelLabel={t.common.cancel}
          destructive={true}
          onConfirm={() => doAction(pendingAction)}
          onCancel={() => {
            setPendingAction(null)
            setCancellationReason('')
          }}
        >
          <div className="mt-4">
            <label className="block text-xs font-medium text-[#7a6a57] mb-1">Reason (optional)</label>
            <textarea
              className="w-full p-2.5 rounded-lg border border-[#e8ddd0] bg-[#faf7f4] text-sm text-[#2a2118] outline-none focus:border-[#c9a96e]"
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="E.g., Customer requested via phone..."
            />
          </div>
        </ConfirmDialog>
      ) : (
        <ConfirmDialog
          open={pendingAction !== null}
          title={`${pendingAction}?`}
          description={`Set booking status to ${pendingAction}.`}
          confirmLabel={isPending ? '…' : t.common.confirm}
          cancelLabel={t.common.cancel}
          onConfirm={() => doAction(pendingAction)}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {/* Reschedule Dialog */}
      {isRescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a2118]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#f0e8de] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2a2118]">Reschedule Booking</h3>
              <button 
                onClick={() => setIsRescheduling(false)}
                className="text-[#9a8a7a] hover:text-[#2a2118]"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {rescheduleError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {rescheduleError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#2a2118] mb-2">Select New Date</label>
                <input 
                  type="date"
                  className="w-full p-2.5 rounded-xl border border-[#e8ddd0] text-[#2a2118] outline-none focus:border-[#c9a96e]"
                  value={rescheduleDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2a2118] mb-2">Available Slots</label>
                {isLoadingSlots ? (
                  <p className="text-sm text-[#9a8a7a] py-4 text-center">Loading slots...</p>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-sm text-[#9a8a7a] py-4 text-center">No available slots on this date.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot.startTime}
                        disabled={!slot.available || isPending}
                        onClick={() => setRescheduleSlot(slot.startTime)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                          !slot.available
                            ? 'opacity-40 bg-[#f5ede0] text-[#9a8a7a] cursor-not-allowed border-transparent'
                            : rescheduleSlot === slot.startTime
                            ? 'bg-[#c9a96e] text-white border-[#c9a96e] shadow-sm'
                            : 'bg-white text-[#2a2118] border-[#e8ddd0] hover:border-[#c9a96e] hover:bg-[#faf7f4]'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#f0e8de] flex justify-end gap-3 bg-[#faf7f4]">
              <button
                onClick={() => setIsRescheduling(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#7a6a57] hover:bg-white hover:text-[#2a2118] transition-colors border border-transparent hover:border-[#e8ddd0]"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={doReschedule}
                disabled={!rescheduleSlot || isPending}
                className="px-6 py-2 rounded-xl text-sm font-medium bg-[#2a2118] text-white hover:bg-[#1a1412] transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
