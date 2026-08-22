'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import {
  createAdminSupplier,
  updateAdminSupplier,
} from '@/app/actions/adminSuppliers.actions'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Supplier = Tables<'suppliers'>

interface Props {
  supplier?: Supplier
  isEdit?: boolean
}

export function SupplierForm({ supplier, isEdit }: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isAr = lang === 'ar'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = isEdit && supplier
        ? await updateAdminSupplier(supplier.id, formData)
        : await createAdminSupplier(formData)

      if (!res.success) {
        setError(res.error || 'Failed to save supplier')
      } else {
        router.push('/admin/suppliers')
        router.refresh()
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/suppliers"
          className="p-2 rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit
              ? isAr
                ? 'تعديل بيانات المورد'
                : 'Edit Supplier'
              : isAr
              ? 'إضافة مورد جديد'
              : 'Add New Supplier'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? 'تسجيل جهات التوريد والشركات المتعامل معها'
              : 'Register vendors, companies, and business suppliers'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            {isAr ? 'اسم المورد / الشركة' : 'Supplier / Company Name'} *
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={supplier?.name || ''}
            placeholder={isAr ? 'مثال: شركة الزيوت الطبيعية المحدودة' : 'e.g. Pure Oils Co.'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'رقم الهاتف / الجوال' : 'Phone Number'}
            </label>
            <input
              type="text"
              name="phone"
              defaultValue={supplier?.phone || ''}
              placeholder="05XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              name="email"
              defaultValue={supplier?.email || ''}
              placeholder="vendor@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            {isAr ? 'العنوان / المدينة' : 'Address / City'}
          </label>
          <input
            type="text"
            name="address"
            defaultValue={supplier?.address || ''}
            placeholder={isAr ? 'مثال: الرياض - طريق الملك فهد' : 'e.g. Riyadh - King Fahd Rd'}
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
            defaultValue={supplier?.notes || ''}
            placeholder={isAr ? 'شروط التوريد أو ملاحظات الاتصال...' : 'Terms of supply or contact notes...'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Active status */}
        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={supplier ? supplier.is_active : true}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-xs font-medium text-foreground">
            {isAr ? 'مورد نشط (متاح لإجراء المشتريات)' : 'Active Supplier (available for purchases)'}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/suppliers"
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
            <span>{isAr ? 'حفظ المورد' : 'Save Supplier'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
