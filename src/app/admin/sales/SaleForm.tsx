'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { recordPayment } from '@/app/actions/adminSales.actions'
import { ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-react'

interface Props {
  bookingId?: string
  bookingNumber?: string
  customerId?: string
  customerName?: string
  suggestedAmount?: number
}

export function SaleForm({
  bookingId,
  bookingNumber,
  customerId,
  customerName,
  suggestedAmount,
}: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const isAr = lang === 'ar'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    if (bookingId) {
      formData.set('booking_id', bookingId)
    }
    if (customerId) {
      formData.set('customer_id', customerId)
    }
    if (selectedFile) {
      formData.set('attachment', selectedFile)
    }

    startTransition(async () => {
      const res = await recordPayment(formData)
      if (!res.success) {
        setError(res.error || 'Failed to record transaction')
      } else {
        if (bookingId) {
          router.push(`/admin/bookings/${bookingId}`)
        } else {
          router.push('/admin/sales')
        }
        router.refresh()
      }
    })
  }

  const paymentMethods = [
    { value: 'mada', labelEn: 'Mada', labelAr: 'مدى' },
    { value: 'credit_card', labelEn: 'Credit Card', labelAr: 'بطاقة ائتمانية' },
    { value: 'apple_pay', labelEn: 'Apple Pay', labelAr: 'Apple Pay' },
    { value: 'stc_pay', labelEn: 'STC Pay', labelAr: 'STC Pay' },
    { value: 'cash', labelEn: 'Cash', labelAr: 'نقدي' },
    { value: 'bank_transfer', labelEn: 'Bank Transfer', labelAr: 'تحويل بنكي' },
    { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href={bookingId ? `/admin/bookings/${bookingId}` : '/admin/sales'}
          className="p-2 rounded-xl border border-[#e8e2d9] dark:border-[#382b42] bg-white dark:bg-[#1a141f] text-[#7a6b61] dark:text-[#c4b5a5] hover:text-[#2a2118] dark:hover:text-white hover:bg-[#f8f5f0] dark:hover:bg-[#2e1f38] transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#2a2118] dark:text-[#f8f5f0]">
            {bookingNumber
              ? isAr
                ? `تسجيل دفعة للحجز #${bookingNumber}`
                : `Record Payment for Booking #${bookingNumber}`
              : isAr
              ? 'تسجيل عملية بيع مباشرة / دفعة'
              : 'Record Direct Sale / Inflow'}
          </h1>
          <p className="text-xs text-[#7a6b61] dark:text-[#c4b5a5] mt-0.5">
            {bookingNumber
              ? isAr
                ? `تسجيل دفعة مالية لحساب الحجز رقم ${bookingNumber}`
                : `Record an incoming payment against booking #${bookingNumber}`
              : isAr
              ? 'إدخال تفاصيل الإيراد المالي أو البيع المباشر'
              : 'Enter details for incoming realized revenue or direct counter sale'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1a141f] border border-[#e8e2d9] dark:border-[#382b42] rounded-2xl p-6 shadow-sm space-y-6"
      >
        {/* Context banner if attached to booking */}
        {bookingNumber && (
          <div className="p-4 rounded-xl bg-[#6F4E7C]/5 dark:bg-[#6F4E7C]/15 border border-[#6F4E7C]/20 text-sm space-y-1">
            <div className="flex justify-between items-center text-xs text-[#7a6b61] dark:text-[#c4b5a5]">
              <span>{isAr ? 'الحجز المرتبط:' : 'Linked Booking:'}</span>
              <span className="font-semibold text-[#2a2118] dark:text-[#f8f5f0]">#{bookingNumber}</span>
            </div>
            {customerName && (
              <div className="flex justify-between items-center text-xs text-[#7a6b61] dark:text-[#c4b5a5]">
                <span>{isAr ? 'العميل:' : 'Customer:'}</span>
                <span className="font-medium text-[#2a2118] dark:text-[#f8f5f0]">{customerName}</span>
              </div>
            )}
            {suggestedAmount !== undefined && (
              <div className="flex justify-between items-center text-xs text-[#7a6b61] dark:text-[#c4b5a5]">
                <span>{isAr ? 'المبلغ المتبقي المطلوب:' : 'Balance Due:'}</span>
                <span className="font-bold text-[#6F4E7C] dark:text-[#A98FB8]">
                  {suggestedAmount.toFixed(2)} SAR
                </span>
              </div>
            )}
          </div>
        )}

        {/* Amount & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2a2118] dark:text-[#f8f5f0] mb-1.5">
              {isAr ? 'المبلغ المستلم (ر.س) *' : 'Amount Received (SAR) *'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                required
                defaultValue={suggestedAmount ?? ''}
                placeholder="0.00"
                className="w-full text-sm rounded-xl border border-[#e8e2d9] dark:border-[#382b42] bg-[#f8f5f0] dark:bg-[#2e1f38] px-3.5 py-2.5 text-[#2a2118] dark:text-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-[#6F4E7C]/20 focus:border-[#6F4E7C]"
              />
              <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#7a6b61] dark:text-[#c4b5a5]">
                SAR
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2a2118] dark:text-[#f8f5f0] mb-1.5">
              {isAr ? 'طريقة الدفع *' : 'Payment Method *'}
            </label>
            <select
              name="payment_method"
              required
              defaultValue="mada"
              className="w-full text-sm rounded-xl border border-[#e8e2d9] dark:border-[#382b42] bg-[#f8f5f0] dark:bg-[#2e1f38] px-3.5 py-2.5 text-[#2a2118] dark:text-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-[#6F4E7C]/20 focus:border-[#6F4E7C]"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {isAr ? m.labelAr : m.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reference & Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2a2118] dark:text-[#f8f5f0] mb-1.5">
              {isAr ? 'رقم الإيصال / المرجع (اختياري)' : 'Receipt / Reference (Optional)'}
            </label>
            <input
              type="text"
              name="reference"
              placeholder={isAr ? 'توليد تلقائي إذا تُرك فارغاً' : 'Auto-generated if left blank'}
              className="w-full text-sm rounded-xl border border-[#e8e2d9] dark:border-[#382b42] bg-[#f8f5f0] dark:bg-[#2e1f38] px-3.5 py-2.5 text-[#2a2118] dark:text-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-[#6F4E7C]/20 focus:border-[#6F4E7C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2a2118] dark:text-[#f8f5f0] mb-1.5">
              {isAr ? 'مصدر المعاملة' : 'Source'}
            </label>
            <select
              name="source"
              defaultValue={bookingId ? 'booking' : 'direct_sale'}
              className="w-full text-sm rounded-xl border border-[#e8e2d9] dark:border-[#382b42] bg-[#f8f5f0] dark:bg-[#2e1f38] px-3.5 py-2.5 text-[#2a2118] dark:text-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-[#6F4E7C]/20 focus:border-[#6F4E7C]"
            >
              <option value="direct_sale">{isAr ? 'بيع مباشر / كاونتر' : 'Direct Sale / Counter'}</option>
              <option value="booking">{isAr ? 'حجز عميل' : 'Booking'}</option>
              <option value="admin">{isAr ? 'إدخال يدوي للإدارة' : 'Admin Manual'}</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#2a2118] dark:text-[#f8f5f0] mb-1.5">
            {isAr ? 'ملاحظات المعاملة' : 'Transaction Notes'}
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder={
              isAr
                ? 'أي ملاحظات إضافية، مثل تفاصيل المنتجات المشتراة أو شروط الدفع…'
                : 'Any additional notes, product items sold, or payment terms…'
            }
            className="w-full text-sm rounded-xl border border-[#e8e2d9] dark:border-[#382b42] bg-[#f8f5f0] dark:bg-[#2e1f38] px-3.5 py-2.5 text-[#2a2118] dark:text-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-[#6F4E7C]/20 focus:border-[#6F4E7C]"
          />
        </div>

        {/* Attachment Upload */}
        <div>
          <label className="block text-xs font-semibold text-[#2a2118] dark:text-[#f8f5f0] mb-1.5">
            {isAr ? 'إرفاق إيصال / مستند الدفع (اختياري)' : 'Attach Receipt / POS Slip (Optional)'}
          </label>
          <div className="border border-dashed border-[#e8e2d9] dark:border-[#382b42] rounded-xl p-4 text-center hover:bg-[#f8f5f0]/50 dark:hover:bg-[#2e1f38]/30 transition-colors">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              id="file-upload"
              onChange={(e) => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0])
              }}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload className="w-6 h-6 text-[#7a6b61] dark:text-[#c4b5a5] mx-auto mb-2" />
              <span className="text-xs font-medium text-[#6F4E7C] dark:text-[#A98FB8] hover:underline">
                {selectedFile
                  ? selectedFile.name
                  : isAr
                  ? 'انقر لرفع إيصال الدفع أو السحب (JPG, PNG, PDF حتى 5MB)'
                  : 'Click to upload receipt or POS slip (JPG, PNG, PDF up to 5MB)'}
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8e2d9] dark:border-[#382b42]">
          <Link
            href={bookingId ? `/admin/bookings/${bookingId}` : '/admin/sales'}
            className="px-4 py-2.5 rounded-xl border border-[#e8e2d9] dark:border-[#382b42] text-xs font-semibold text-[#7a6b61] dark:text-[#c4b5a5] hover:bg-[#f8f5f0] dark:hover:bg-[#2e1f38] transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F4E7C] text-white text-xs font-semibold hover:bg-[#5D3D6A] transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isAr ? 'تسجيل العملية المالية' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}
