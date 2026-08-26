'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import {
  createAdminPurchase,
  updateAdminPurchase,
  getPurchaseSignedUrl,
} from '@/app/actions/adminPurchases.actions'
import { ArrowLeft, ArrowRight, Loader2, Upload, FileText, ExternalLink } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Purchase = Tables<'purchases'>
type Supplier = Tables<'suppliers'>

interface Props {
  purchase?: Purchase
  suppliers: Supplier[]
  isEdit?: boolean
}

export function PurchaseForm({ purchase, suppliers, isEdit }: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docLoading, setDocLoading] = useState(false)

  const isAr = lang === 'ar'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    if (selectedFile) {
      formData.set('attachment', selectedFile)
    }

    startTransition(async () => {
      const res = isEdit && purchase
        ? await updateAdminPurchase(purchase.id, formData)
        : await createAdminPurchase(formData)

      if (!res.success) {
        setError(res.error || 'Failed to save purchase')
      } else {
        router.push('/admin/purchases')
        router.refresh()
      }
    })
  }

  async function handleViewCurrentDoc() {
    if (!purchase?.attachment_url) return
    setDocLoading(true)
    try {
      const url = await getPurchaseSignedUrl(purchase.attachment_url)
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        alert('Could not generate document preview link')
      }
    } catch {
      alert('Failed to preview document')
    } finally {
      setDocLoading(false)
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/purchases"
          className="p-2 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit
              ? isAr
                ? 'تعديل عملية الشراء'
                : 'Edit Purchase'
              : isAr
              ? 'تسجيل مشتريات جديدة'
              : 'Record New Purchase'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? 'تسجيل فواتير المشتريات ومستلزمات المركز من الموردين'
              : 'Record vendor procurement invoices and spa supplies'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-bg border border-error-border text-xs font-medium text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Supplier */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'المورد / جهة التوريد' : 'Supplier'} *
            </label>
            <select
              name="supplier_id"
              required
              defaultValue={purchase?.supplier_id || (suppliers[0]?.id ?? '')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {!s.is_active ? `(${isAr ? 'غير نشط' : 'Inactive'})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'تاريخ الشراء' : 'Purchase Date'} *
            </label>
            <input
              type="date"
              name="date"
              required
              defaultValue={purchase?.date || todayStr}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            {isAr ? 'وصف المشتريات / البضاعة' : 'Purchase Description / Items'} *
          </label>
          <input
            type="text"
            name="description"
            required
            defaultValue={purchase?.description || ''}
            placeholder={isAr ? 'مثال: توريد زيوت عطرية ومناشف معقمة' : 'e.g. Essential oils and sanitized towels supply'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'المبلغ (ريال سعودي)' : 'Amount (SAR)'} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              required
              defaultValue={purchase?.amount || ''}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'طريقة الدفع' : 'Payment Method'} *
            </label>
            <select
              name="payment_method"
              required
              defaultValue={purchase?.payment_method || 'bank_transfer'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="bank_transfer">{isAr ? 'تحويل بنكي (Bank Transfer)' : 'Bank Transfer'}</option>
              <option value="card">{isAr ? 'بطاقة (Card)' : 'Card'}</option>
              <option value="cash">{isAr ? 'نقدي (Cash)' : 'Cash'}</option>
              <option value="other">{isAr ? 'أخرى (Other)' : 'Other'}</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'حالة السداد' : 'Payment Status'} *
            </label>
            <select
              name="payment_status"
              required
              defaultValue={purchase?.payment_status || 'paid'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="paid">{isAr ? 'مسدد بالكامل (Paid)' : 'Paid'}</option>
              <option value="pending">{isAr ? 'معلق / آجل (Pending)' : 'Pending'}</option>
              <option value="cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
            </select>
          </div>
        </div>

        {/* Reference */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            {isAr ? 'رقم الفاتورة أو إذن الشراء (اختياري)' : 'Invoice # / Purchase Ref (Optional)'}
          </label>
          <input
            type="text"
            name="reference"
            defaultValue={purchase?.reference || ''}
            placeholder={isAr ? 'اتركه فارغاً للتوليد التلقائي' : 'Leave empty for auto-generated ID'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            {isAr ? 'ملاحظات' : 'Notes'}
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={purchase?.notes || ''}
            placeholder={isAr ? 'ملاحظات حول البضاعة أو التسليم...' : 'Notes about items or delivery...'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Document Attachment */}
        <div className="pt-2 border-t border-border">
          <label className="block text-xs font-semibold text-muted-foreground mb-2">
            {isAr ? 'فاتورة الشراء المرفقة' : 'Purchase Invoice Attachment'}
          </label>

          {purchase?.attachment_url && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-foreground">
                  {isAr ? 'فاتورة الشراء الحالية محفوظة بأمان' : 'Current invoice securely stored'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleViewCurrentDoc}
                disabled={docLoading}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                {docLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span>{isAr ? 'معاينة الفاتورة' : 'Preview'}</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-muted cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span>{selectedFile ? selectedFile.name : isAr ? 'اختيار ملف الفاتورة (JPG, PNG, WebP, PDF)' : 'Choose file (JPG, PNG, WebP, PDF)'}</span>
              <input
                type="file"
                name="attachment"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs text-error hover:underline"
              >
                {isAr ? 'إلغاء الملف' : 'Remove'}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {isAr
              ? 'الحد الأقصى للحجم 5 ميجابايت. يتم حفظ المستند بشكل خاص وآمن.'
              : 'Max size 5MB. Document is stored privately and securely.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/purchases"
            className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-surface transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isAr ? 'حفظ الشراء' : 'Save Purchase'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
