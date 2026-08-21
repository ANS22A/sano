'use client'

import { useState, useTransition, useEffect } from 'react'
import { updateBookingStatus, rescheduleBooking } from '@/app/actions/adminBookings.actions'
import { getBookingSlots } from '@/app/actions/booking.actions'
import { issueRefund, getSaleSignedUrl, type BookingFinancialSummary } from '@/app/actions/adminSales.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { AdminDocumentLink } from '@/components/admin/ui/AdminDocumentLink'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  FileText,
  CalendarDays,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
    customers: { id: string; full_name: string; phone: string; email: string } | null
    services: { name_en: string; name_ar: string } | null
    locations: { name_en: string; name_ar: string; address_en: string } | null
    profiles?: { full_name: string } | null
  }
  financialSummary: BookingFinancialSummary | null
}

type PendingAction = 'confirmed' | 'cancelled' | 'completed' | 'no_show' | null

export function BookingDetailClient({ booking, financialSummary }: BookingDetailClientProps) {
  const { t, lang } = useAdmin()
  const router = useRouter()
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

  // Refund dialog state
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundMethod, setRefundMethod] = useState('mada')
  const [refundReason, setRefundReason] = useState('')
  const [refundError, setRefundError] = useState<string | null>(null)

  const isAr = lang === 'ar'

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
    async function loadSlots() {
      setIsLoadingSlots(true)
      setRescheduleError('')
      try {
        const res = await getBookingSlots(booking.service_id, booking.package_slug, booking.location_id, rescheduleDate)
        if (active) {
          setRescheduleSlots(res.slots)
          setRescheduleSlot('')
        }
      } catch {
        if (active) setRescheduleError('Failed to load slots')
      } finally {
        if (active) setIsLoadingSlots(false)
      }
    }
    loadSlots()
    return () => {
      active = false
    }
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
        router.refresh()
      }
    })
  }

  function handleIssueRefund(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setRefundError(null)

    const formData = new FormData()
    formData.set('booking_id', booking.id)
    if (booking.customers?.id) {
      formData.set('customer_id', booking.customers.id)
    }
    formData.set('amount', refundAmount)
    formData.set('payment_method', refundMethod)
    formData.set('notes', refundReason)

    startTransition(async () => {
      const res = await issueRefund(formData)
      if (!res.success) {
        setRefundError(res.error || 'Failed to process refund')
      } else {
        setIsRefunding(false)
        setRefundAmount('')
        setRefundReason('')
        router.refresh()
      }
    })
  }

  const cust = booking.customers
  const svc = booking.services

  const priceSar = Number(booking.price_sar) || 0
  const netPaid = financialSummary?.net_paid ?? 0
  const totalPaid = financialSummary?.total_paid ?? 0
  const totalRefunded = financialSummary?.total_refunded ?? 0
  const balanceDue = financialSummary?.balance_due ?? priceSar
  const isFullyPaid = financialSummary?.is_fully_paid ?? false
  const hasOverpayment = financialSummary?.has_overpayment ?? false
  const salesHistory = financialSummary?.sales ?? []

  return (
    <div className="max-w-5xl space-y-6">
      {/* Top bar / Back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="p-2 rounded-xl border border-[#e8ddd0] bg-white text-[#7a6a57] hover:text-[#2a2118] hover:bg-[#faf7f4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#2a2118]">
                {t.bookings.bookingNumber} {booking.booking_number}
              </h1>
              <AdminBadge
                status={currentStatus}
                label={
                  currentStatus === 'pending'
                    ? isAr
                      ? 'قيد الانتظار'
                      : 'Pending'
                    : currentStatus === 'confirmed'
                    ? isAr
                      ? 'مؤكد'
                      : 'Confirmed'
                    : currentStatus === 'completed'
                    ? isAr
                      ? 'مكتمل'
                      : 'Completed'
                    : currentStatus === 'cancelled'
                    ? isAr
                      ? 'ملغى'
                      : 'Cancelled'
                    : currentStatus === 'no_show'
                    ? isAr
                      ? 'لم يحضر'
                      : 'No-Show'
                    : currentStatus
                }
              />
              {/* Payment Status Badge */}
              {isFullyPaid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  {isAr ? 'مدفوع بالكامل' : 'Fully Paid'}
                </span>
              ) : netPaid > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                  <AlertCircle className="w-3 h-3" />
                  {isAr ? 'مدفوع جزئياً' : 'Partially Paid'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-3 h-3" />
                  {isAr ? 'غير مدفوع' : 'Unpaid'}
                </span>
              )}
              {hasOverpayment && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {isAr ? 'فائض دفع' : 'Overpaid'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9a8a7a] mt-0.5">
              {t.bookings.createdAt} {new Date(booking.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Reschedule Button */}
        {['pending', 'confirmed'].includes(currentStatus) && (
          <button
            onClick={() => setIsRescheduling(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-[#e8ddd0] text-[#2a2118] hover:bg-[#faf7f4] transition-colors"
          >
            <CalendarDays className="w-4 h-4 text-[#c9a96e]" />
            {isAr ? 'إعادة جدولة الحجز' : 'Reschedule Booking'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Financials, & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info Card */}
          <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f0e8de] bg-[#faf7f4]">
              <h2 className="text-sm font-semibold text-[#2a2118]">{isAr ? 'تفاصيل الحجز' : 'Booking Details'}</h2>
            </div>
            <dl className="divide-y divide-[#f0e8de]">
              {[
                [lang === 'ar' && svc ? svc.name_ar : svc?.name_en ?? '—', t.bookings.service],
                [booking.date, t.bookings.date],
                [`${booking.start_time.slice(0, 5)} → ${booking.end_time.slice(0, 5)}`, t.bookings.time],
                [
                  booking.locations
                    ? lang === 'ar'
                      ? booking.locations.name_ar
                      : booking.locations.name_en
                    : '—',
                  t.bookings.location ?? 'Location',
                ],
                [`${booking.price_sar} ${t.common.sar}`, t.bookings.price],
                [(booking as { source?: string }).source ?? 'website', lang === 'ar' ? 'المصدر' : 'Source'],
                [
                  (booking as { profiles?: { full_name: string } | null }).profiles?.full_name ?? '—',
                  lang === 'ar' ? 'أُنشئ بواسطة' : 'Created By',
                ],
              ].map(([value, label]) => (
                <div key={label} className="flex px-6 py-3.5 gap-4">
                  <dt className="text-xs font-medium text-[#9a8a7a] w-32 shrink-0 flex items-center">{label}</dt>
                  <dd className="text-sm text-[#2a2118] flex-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* FINANCIAL / PAYMENTS SECTION */}
          <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#f0e8de] bg-[#faf7f4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#6F4E7C]" />
                <h2 className="text-sm font-bold text-[#2a2118]">
                  {isAr ? 'البيانات المالية والمدفوعات' : 'Financial Ledger & Payments'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {netPaid > 0 && (
                  <button
                    onClick={() => {
                      setRefundAmount(netPaid.toString())
                      setIsRefunding(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isAr ? 'استرجاع مبلغ' : 'Issue Refund'}
                  </button>
                )}
                <Link
                  href={`/admin/sales/new?bookingId=${booking.id}&bookingNumber=${booking.booking_number}&customerId=${
                    booking.customers?.id ?? ''
                  }&customerName=${encodeURIComponent(
                    booking.customers?.full_name ?? ''
                  )}&amount=${balanceDue}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6F4E7C] text-white hover:bg-[#5D3D6A] text-xs font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAr ? 'تسجيل دفعة' : 'Record Payment'}
                </Link>
              </div>
            </div>

            {/* Financial Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#faf7f4]/40 border-b border-[#f0e8de]">
              <div className="p-3 bg-white rounded-xl border border-[#e8ddd0]/70">
                <p className="text-xs text-[#9a8a7a] font-medium">{isAr ? 'سعر الحجز' : 'Booking Price'}</p>
                <p className="text-base font-bold text-[#2a2118] mt-1">{priceSar.toFixed(2)} SAR</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e8ddd0]/70">
                <p className="text-xs text-emerald-600 font-medium">{isAr ? 'إجمالي المقبوض' : 'Total Paid'}</p>
                <p className="text-base font-bold text-emerald-600 mt-1">+{totalPaid.toFixed(2)} SAR</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e8ddd0]/70">
                <p className="text-xs text-rose-600 font-medium">{isAr ? 'إجمالي المسترجع' : 'Total Refunded'}</p>
                <p className="text-base font-bold text-rose-600 mt-1">
                  {totalRefunded > 0 ? `-${totalRefunded.toFixed(2)}` : '0.00'} SAR
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e8ddd0]/70">
                <p className="text-xs text-[#6F4E7C] font-semibold">{isAr ? 'المتبقي للدفع' : 'Balance Due'}</p>
                <p
                  className={`text-base font-bold mt-1 ${
                    balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {balanceDue.toFixed(2)} SAR
                </p>
              </div>
            </div>

            {/* Transactions Table / List */}
            <div className="p-5">
              <h3 className="text-xs font-semibold text-[#7a6a57] uppercase tracking-wider mb-3">
                {isAr ? 'سجل المعاملات للحجز' : 'Transaction History'}
              </h3>
              {salesHistory.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e8ddd0] rounded-xl">
                  <Receipt className="w-8 h-8 text-[#9a8a7a] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-medium text-[#7a6a57]">
                    {isAr ? 'لم يتم تسجيل أي مدفوعات لهذا الحجز حتى الآن.' : 'No payment transactions recorded for this booking yet.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#f0e8de] border border-[#e8ddd0] rounded-xl overflow-hidden text-xs">
                  {salesHistory.map((s) => {
                    const isRefund = s.type === 'refund'
                    return (
                      <div
                        key={s.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf7f4] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isRefund
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isRefund ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3" />
                              )}
                              {isRefund ? (isAr ? 'استرجاع' : 'Refund') : (isAr ? 'قبض' : 'Payment')}
                            </span>
                            <span className="font-mono font-medium text-[#2a2118]">{s.reference}</span>
                            <span className="text-[#9a8a7a]">
                              ({s.payment_method.replace('_', ' ')})
                            </span>
                          </div>
                          {s.notes && <p className="text-[#7a6a57]">{s.notes}</p>}
                          <p className="text-[11px] text-[#9a8a7a]">
                            {new Date(s.created_at).toLocaleString()} • {s.profiles?.full_name || 'Admin'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          {s.attachment_url && (
                            <AdminDocumentLink
                              path={s.attachment_url}
                              label={isAr ? 'عرض المستند' : 'View Document'}
                              getSignedUrlAction={getSaleSignedUrl}
                            />
                          )}
                          <span
                            className={`text-sm font-bold ${
                              isRefund ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isRefund ? '-' : '+'}
                            {Number(s.amount).toFixed(2)} SAR
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Customer Notes */}
          <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f0e8de] bg-[#faf7f4]">
              <h2 className="text-sm font-semibold text-[#2a2118]">Customer Notes</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#7a6a57] whitespace-pre-wrap leading-relaxed">
                {booking.notes || 'No notes provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Customer & Status Actions */}
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
                  <p className="text-sm font-medium text-[#2a2118] truncate">{cust?.full_name ?? '—'}</p>
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

          {/* Status Actions */}
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

      {/* Confirm Status Dialog */}
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

      {/* Reschedule Modal */}
      {isRescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a2118]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#f0e8de] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2a2118]">Reschedule Booking</h3>
              <button onClick={() => setIsRescheduling(false)} className="text-[#9a8a7a] hover:text-[#2a2118]">
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
                  min={new Date().toISOString().slice(0, 10)}
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

      {/* Refund Modal */}
      {isRefunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a2118]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#f0e8de] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2a2118]">
                {isAr ? 'إصدار استرجاع مالي' : 'Issue Refund'}
              </h3>
              <button onClick={() => setIsRefunding(false)} className="text-[#9a8a7a] hover:text-[#2a2118]">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueRefund} className="p-6 space-y-4">
              {refundError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                  {refundError}
                </div>
              )}

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                <div className="flex justify-between text-[#7a6a57]">
                  <span>{isAr ? 'الصافي المدفوع للحجز:' : 'Net Paid on Booking:'}</span>
                  <span className="font-semibold text-emerald-600">+{netPaid.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-[#7a6a57]">
                  <span>{isAr ? 'أقصى حد للاسترجاع:' : 'Max Refundable:'}</span>
                  <span className="font-bold text-[#2a2118]">{netPaid.toFixed(2)} SAR</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">
                  {isAr ? 'مبلغ الاسترجاع (ر.س) *' : 'Refund Amount (SAR) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={netPaid}
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full text-sm rounded-xl border border-[#e8ddd0] bg-[#faf7f4] px-3 py-2 text-[#2a2118] outline-none focus:border-[#6F4E7C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">
                  {isAr ? 'طريقة إعادة المبلغ *' : 'Refund Method *'}
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full text-sm rounded-xl border border-[#e8ddd0] bg-[#faf7f4] px-3 py-2 text-[#2a2118] outline-none focus:border-[#6F4E7C]"
                >
                  <option value="mada">{isAr ? 'مدى' : 'Mada'}</option>
                  <option value="credit_card">{isAr ? 'بطاقة ائتمانية' : 'Credit Card'}</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="stc_pay">STC Pay</option>
                  <option value="cash">{isAr ? 'نقدي' : 'Cash'}</option>
                  <option value="bank_transfer">{isAr ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                  <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">
                  {isAr ? 'سبب الاسترجاع *' : 'Refund Reason *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={
                    isAr
                      ? 'سبب إصدار الاسترجاع للعميل…'
                      : 'Reason for issuing refund to customer…'
                  }
                  className="w-full text-sm rounded-xl border border-[#e8ddd0] bg-[#faf7f4] px-3 py-2 text-[#2a2118] outline-none focus:border-[#6F4E7C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#f0e8de]">
                <button
                  type="button"
                  onClick={() => setIsRefunding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#7a6a57] hover:bg-[#faf7f4]"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isAr ? 'تأكيد الاسترجاع' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
