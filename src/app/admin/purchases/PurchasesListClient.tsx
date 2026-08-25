'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { archiveAdminPurchase, getPurchaseSignedUrl } from '@/app/actions/adminPurchases.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { AdminDocumentLink } from '@/components/admin/ui/AdminDocumentLink'
import {
  ShoppingBag,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  DollarSign,
  Building2,
} from 'lucide-react'
import type { Tables } from '@/types/database.types'

interface PurchaseWithRelations extends Tables<'purchases'> {
  suppliers?: { id: string; name: string; phone: string | null } | null
  profiles?: { full_name: string; email: string } | null
}

interface Props {
  purchases: PurchaseWithRelations[]
  total: number
  totalAmount: number
  suppliers: Tables<'suppliers'>[]
  currentPage: number
  currentQ?: string
  currentSupplierId?: string
  currentPaymentStatus?: string
  currentPaymentMethod?: string
  currentFromDate?: string
  currentToDate?: string
  includeArchived?: boolean
}

export function PurchasesListClient({
  purchases: initialPurchases,
  total,
  totalAmount,
  suppliers,
  currentSupplierId = 'all',
  currentPaymentStatus = 'all',
  currentPaymentMethod = 'all',
  currentFromDate = '',
  currentToDate = '',
  includeArchived = false,
}: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [purchases, setPurchases] = useState(initialPurchases)
  const [isPending, startTransition] = useTransition()

  const isAr = lang === 'ar'

  function handleArchiveToggle(purchase: PurchaseWithRelations) {
    const nextState = !purchase.is_archived
    const confirmMsg = nextState
      ? isAr
        ? 'هل أنت متأكد من أرشفة عملية الشراء هذه؟'
        : 'Are you sure you want to archive this purchase?'
      : isAr
      ? 'هل أنت متأكد من استعادة عملية الشراء هذه؟'
      : 'Are you sure you want to restore this purchase?'

    if (!confirm(confirmMsg)) return

    startTransition(async () => {
      const res = await archiveAdminPurchase(purchase.id, nextState)
      if (res.success) {
        setPurchases((prev) =>
          prev.map((p) => (p.id === purchase.id ? { ...p, is_archived: nextState } : p))
        )
        router.refresh()
      } else {
        alert(res.error || 'Operation failed')
      }
    })
  }

  function handleFilterChange(key: string, value: string) {
    const searchParams = new URLSearchParams(window.location.search)
    if (value && value !== 'all') {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    searchParams.set('page', '1')
    router.push(`/admin/purchases?${searchParams.toString()}`)
  }

  const paymentStatuses = [
    { value: 'all', labelEn: 'All Statuses', labelAr: 'كل حالات السداد' },
    { value: 'paid', labelEn: 'Paid', labelAr: 'مسدد' },
    { value: 'pending', labelEn: 'Pending', labelAr: 'معلق' },
    { value: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي' },
  ]

  const paymentMethods = [
    { value: 'all', labelEn: 'All Methods', labelAr: 'كل طرق الدفع' },
    { value: 'bank_transfer', labelEn: 'Bank Transfer', labelAr: 'تحويل بنكي' },
    { value: 'card', labelEn: 'Card', labelAr: 'بطاقة' },
    { value: 'cash', labelEn: 'Cash', labelAr: 'نقدي' },
    { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isAr ? 'إدارة المشتريات' : 'Purchases Management'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? 'سجل التوريدات وعمليات الشراء من الموردين'
              : 'Ledger of procurement transactions and vendor orders'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/suppliers"
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border bg-white text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            {isAr ? 'الموردون' : 'Suppliers'}
          </Link>
          <Link
            href="/admin/purchases/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'تسجيل مشتريات' : 'Record Purchase'}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-accent">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isAr ? 'إجمالي المشتريات المعروضة' : 'Total Filtered Purchases'}
            </p>
            <p className="text-lg font-bold text-foreground">
              {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-accent">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isAr ? 'عدد الفواتير' : 'Total Invoices'}
            </p>
            <p className="text-lg font-bold text-foreground">{total}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-border p-4 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <AdminSearchBar
              placeholder={isAr ? 'البحث بالوصف، المرجع، الملاحظات…' : 'Search description, reference, notes…'}
              paramName="q"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Supplier Filter */}
            <select
              value={currentSupplierId}
              onChange={(e) => handleFilterChange('supplierId', e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">{isAr ? 'كل الموردين' : 'All Suppliers'}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={currentPaymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {paymentStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {isAr ? s.labelAr : s.labelEn}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={currentPaymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {isAr ? m.labelAr : m.labelEn}
                </option>
              ))}
            </select>

            {/* Date from */}
            <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1.5 rounded-xl border border-border">
              <span className="text-[11px] text-muted-foreground">{isAr ? 'من:' : 'From:'}</span>
              <input
                type="date"
                defaultValue={currentFromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none"
              />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1.5 rounded-xl border border-border">
              <span className="text-[11px] text-muted-foreground">{isAr ? 'إلى:' : 'To:'}</span>
              <input
                type="date"
                defaultValue={currentToDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none"
              />
            </div>

            {/* Include Archived toggle */}
            <button
              type="button"
              onClick={() => handleFilterChange('archived', includeArchived ? '' : 'true')}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                includeArchived
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
              }`}
            >
              {includeArchived
                ? isAr
                  ? 'المؤرشف معروض'
                  : 'Archived Included'
                : isAr
                ? 'عرض المؤرشف'
                : 'Show Archived'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {purchases.length === 0 ? (
          <AdminEmptyState
            icon={<ShoppingBag className="w-6 h-6 text-muted-foreground" />}
            title={isAr ? 'لا توجد مشتريات مطابقة' : 'No purchases found'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'التاريخ / المرجع' : 'Date / Ref'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'المورد' : 'Supplier'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الوصف' : 'Description'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الحالة' : 'Payment Status'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'المستند' : 'Document'}
                  </th>
                  <th className="text-end px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.date}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{p.reference || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="font-medium text-foreground">
                          {p.suppliers?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground max-w-xs truncate">{p.description}</p>
                      {p.notes && (
                        <p className="text-xs text-muted-foreground max-w-xs truncate">{p.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={
                          p.payment_status === 'paid'
                            ? 'confirmed'
                            : p.payment_status === 'pending'
                            ? 'pending'
                            : 'cancelled'
                        }
                        label={
                          p.payment_status === 'paid'
                            ? isAr
                              ? 'مسدد'
                              : 'Paid'
                            : p.payment_status === 'pending'
                            ? isAr
                              ? 'معلق'
                              : 'Pending'
                            : isAr
                            ? 'ملغي'
                            : 'Cancelled'
                        }
                      />
                      <span className="block text-[11px] text-muted-foreground mt-0.5 capitalize">
                        {p.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                    </td>
                    <td className="px-4 py-3">
                      {p.attachment_url ? (
                        <AdminDocumentLink
                          path={p.attachment_url}
                          label={isAr ? 'معاينة' : 'Invoice'}
                          getSignedUrlAction={getPurchaseSignedUrl}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/purchases/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleArchiveToggle(p)}
                          disabled={isPending}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.is_archived
                              ? 'text-success hover:bg-success-bg'
                              : 'text-warning hover:bg-warning-bg'
                          }`}
                          title={
                            p.is_archived
                              ? isAr
                                ? 'استعادة'
                                : 'Restore'
                              : isAr
                              ? 'أرشفة'
                              : 'Archive'
                          }
                        >
                          {p.is_archived ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination total={total} perPage={25} />
      </div>
    </div>
  )
}
