'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { archiveSale, getSaleSignedUrl, type SaleRecord } from '@/app/actions/adminSales.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { AdminDocumentLink } from '@/components/admin/ui/AdminDocumentLink'
import {
  CreditCard,
  Plus,
  Archive,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Slash,
} from 'lucide-react'

interface Props {
  sales: SaleRecord[]
  total: number
  totalPayments: number
  totalRefunds: number
  totalRealized: number
  currentPage?: number
  currentQ?: string
  currentType?: string
  currentStatus?: string
  currentSource?: string
  currentPaymentMethod?: string
  currentFromDate?: string
  currentToDate?: string
  includeArchived?: boolean
}

export function SalesListClient({
  sales: initialSales,
  total,
  totalPayments,
  totalRefunds,
  totalRealized,
  currentType = 'all',
  currentStatus = 'all',
  currentSource = 'all',
  currentPaymentMethod = 'all',
  currentFromDate = '',
  currentToDate = '',
  includeArchived = false,
}: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [sales, setSales] = useState(initialSales)
  const [isPending, startTransition] = useTransition()

  const isAr = lang === 'ar'

  function handleFilterChange(key: string, value: string) {
    const searchParams = new URLSearchParams(window.location.search)
    if (value && value !== 'all') {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    searchParams.set('page', '1')
    router.push(`/admin/sales?${searchParams.toString()}`)
  }

  function handleVoid(saleId: string) {
    const confirmMsg = isAr
      ? 'هل أنت متأكد من إلغاء/أرشفة هذه المعاملة المالية؟'
      : 'Are you sure you want to void/archive this financial transaction?'

    if (!confirm(confirmMsg)) return

    startTransition(async () => {
      const res = await archiveSale(saleId)
      if (res.success) {
        setSales((prev) =>
          prev.map((s) => (s.id === saleId ? { ...s, is_archived: true, status: 'void' } : s))
        )
        router.refresh()
      } else {
        alert(res.error || 'Operation failed')
      }
    })
  }

  const paymentMethods = [
    { value: 'all', labelEn: 'All Payment Methods', labelAr: 'كل طرق الدفع' },
    { value: 'mada', labelEn: 'Mada', labelAr: 'مدى' },
    { value: 'credit_card', labelEn: 'Credit Card', labelAr: 'بطاقة ائتمانية' },
    { value: 'apple_pay', labelEn: 'Apple Pay', labelAr: 'Apple Pay' },
    { value: 'stc_pay', labelEn: 'STC Pay', labelAr: 'STC Pay' },
    { value: 'cash', labelEn: 'Cash', labelAr: 'نقدي' },
    { value: 'bank_transfer', labelEn: 'Bank Transfer', labelAr: 'تحويل بنكي' },
    { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
  ]

  const transactionTypes = [
    { value: 'all', labelEn: 'All Types', labelAr: 'كل العمليات' },
    { value: 'payment', labelEn: 'Payments', labelAr: 'مدفوعات' },
    { value: 'refund', labelEn: 'Refunds', labelAr: 'استرجاعات' },
  ]

  const sources = [
    { value: 'all', labelEn: 'All Sources', labelAr: 'كل المصادر' },
    { value: 'booking', labelEn: 'Booking Engine', labelAr: 'نظام الحجوزات' },
    { value: 'direct_sale', labelEn: 'Direct Sale', labelAr: 'مبيعات مباشرة' },
    { value: 'admin', labelEn: 'Admin Manual', labelAr: 'إدخال يدوي' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
            {isAr ? 'سجل المبيعات والمدفوعات' : 'Sales & Revenue Ledger'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAr
              ? 'تتبع الإيرادات المحققة والمعاملات المالية المباشرة والمرتجعات'
              : 'Track realized revenue, incoming payments, refunds, and direct transactions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/sales/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'تسجيل مبيعات / دفعة جديدة' : 'New Direct Sale / Payment'}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Realized Revenue */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              {isAr ? 'صافي الإيراد المحقق' : 'Net Realized Revenue'}
            </span>
            <div className="p-2 rounded-lg bg-success-bg dark:bg-success-bg text-success dark:text-success">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-heading font-bold text-success dark:text-success">
              {totalRealized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-sans font-normal text-muted-foreground dark:text-muted-foreground">SAR</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? 'المدفوعات ناقص الاسترجاعات' : 'Gross payments minus refunds'}
            </p>
          </div>
        </div>

        {/* Gross Payments */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              {isAr ? 'إجمالي المقبوضات' : 'Total Payments Received'}
            </span>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary dark:text-muted-foreground">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-heading font-bold text-foreground">
              {totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-sans font-normal text-muted-foreground dark:text-muted-foreground">SAR</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? 'عمليات الدفع المكتملة' : 'Completed inflow transactions'}
            </p>
          </div>
        </div>

        {/* Total Refunds */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              {isAr ? 'إجمالي المرتجعات' : 'Total Refunds Issued'}
            </span>
            <div className="p-2 rounded-lg bg-error-bg dark:bg-error-bg/40 text-error dark:text-error">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-heading font-bold text-error dark:text-error">
              {totalRefunds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-sans font-normal text-muted-foreground dark:text-muted-foreground">SAR</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? 'المبالغ المسترجعة للعملاء' : 'Refunds returned to customers'}
            </p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              {isAr ? 'عدد المعاملات' : 'Total Transactions'}
            </span>
            <div className="p-2 rounded-lg bg-warning-bg dark:bg-warning-bg text-warning dark:text-warning">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-heading font-bold text-foreground">
              {total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? 'معاملة مسجلة في السجل' : 'Transactions in ledger'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-elevated border border-border p-4 rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <AdminSearchBar
              placeholder={
                isAr ? 'بحث برقم الإيصال أو الملاحظات…' : 'Search by reference or notes…'
              }
            />
          </div>

          {/* Type */}
          <div>
            <select
              value={currentType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full text-sm rounded-lg border border-border-subtle bg-surface px-3 py-2 text-foreground"
            >
              {transactionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {isAr ? t.labelAr : t.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={currentPaymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="w-full text-sm rounded-lg border border-border-subtle bg-surface px-3 py-2 text-foreground"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {isAr ? m.labelAr : m.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <select
              value={currentSource}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full text-sm rounded-lg border border-border-subtle bg-surface px-3 py-2 text-foreground"
            >
              {sources.map((s) => (
                <option key={s.value} value={s.value}>
                  {isAr ? s.labelAr : s.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={currentStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full text-sm rounded-lg border border-border-subtle bg-surface px-3 py-2 text-foreground"
            >
              <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
              <option value="void">{isAr ? 'ملغى / باطل' : 'Void'}</option>
            </select>
          </div>

          {/* Archived Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => handleFilterChange('archived', e.target.checked ? 'true' : '')}
                className="rounded border-border-subtle text-secondary focus:ring-ring"
              />
              {isAr ? 'عرض الملغى / المؤرشف' : 'Show Void/Archived'}
            </label>
          </div>
        </div>

        {/* Date Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-subtle/50/50 text-xs text-muted-foreground dark:text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{isAr ? 'من تاريخ:' : 'From:'}</span>
            <input
              type="date"
              value={currentFromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>{isAr ? 'إلى تاريخ:' : 'To:'}</span>
            <input
              type="date"
              value={currentToDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-foreground"
            />
          </div>
          {(currentFromDate || currentToDate || currentType !== 'all' || currentPaymentMethod !== 'all' || currentSource !== 'all') && (
            <button
              onClick={() => router.push('/admin/sales')}
              className="text-xs text-secondary dark:text-muted-foreground hover:underline font-medium ms-auto"
            >
              {isAr ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Sales List Table */}
      {sales.length === 0 ? (
        <AdminEmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title={isAr ? 'لا توجد معاملات مبيعات' : 'No sales transactions found'}
          description={
            isAr
              ? 'لم يتم العثور على معاملات مطابقة للفلاتر المحددة.'
              : 'No transactions match the selected filters.'
          }
          action={
            <Link
              href="/admin/sales/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isAr ? 'تسجيل مبيعات جديدة' : 'Record New Sale'}
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-surface/60 text-muted-foreground dark:text-muted-foreground border-b border-border-subtle">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'المرجع / المعاملة' : 'Ref / Transaction'}</th>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'المصدر / الحجز' : 'Source / Booking'}</th>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'العميل' : 'Customer'}</th>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'طريقة الدفع' : 'Payment Method'}</th>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 font-medium text-start">{isAr ? 'التاريخ / المسجل' : 'Date / Recorded By'}</th>
                  <th className="py-3.5 px-4 font-medium text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sales.map((sale) => {
                  const isRefund = sale.type === 'refund'
                  const isVoid = sale.status === 'void' || sale.is_archived
                  const dateFormatted = new Date(sale.created_at).toLocaleDateString(
                    isAr ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  )

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-surface/50 dark:hover:bg-primary/30 transition-colors ${
                        isVoid ? 'opacity-50 bg-muted dark:bg-muted' : ''
                      }`}
                    >
                      {/* Reference */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isRefund
                                ? 'bg-error-bg dark:bg-error-bg/60 text-error dark:text-error'
                                : 'bg-success-bg dark:bg-success-bg text-success dark:text-success'
                            }`}
                          >
                            {isRefund ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3" />
                            )}
                            {isRefund ? (isAr ? 'استرجاع' : 'Refund') : (isAr ? 'قبض' : 'Payment')}
                          </span>
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {sale.reference}
                          </span>
                        </div>
                        {sale.notes && (
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 max-w-xs truncate">
                            {sale.notes}
                          </p>
                        )}
                      </td>

                      {/* Source / Booking */}
                      <td className="py-3.5 px-4">
                        {sale.bookings ? (
                          <Link
                            href={`/admin/bookings/${sale.bookings.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-secondary dark:text-muted-foreground hover:underline"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{sale.bookings.booking_number}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground inline-flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            {sale.source === 'direct_sale'
                              ? isAr
                                ? 'بيع مباشر'
                                : 'Direct Sale'
                              : isAr
                              ? 'يدوي'
                              : 'Manual'}
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        {sale.customers ? (
                          <div>
                            <p className="font-medium text-xs text-foreground">
                              {sale.customers.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground" dir="ltr">
                              {sale.customers.phone}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground italic">
                            {isAr ? 'عميل مباشر (غير مسجل)' : 'Walk-in Customer'}
                          </span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/5 text-foreground capitalize">
                          {sale.payment_method.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-semibold text-sm">
                        <span
                          className={
                            isRefund
                              ? 'text-error dark:text-error'
                              : 'text-success dark:text-success'
                          }
                        >
                          {isRefund ? '-' : '+'}
                          {Number(sale.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          <span className="text-xs font-normal">SAR</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isVoid
                              ? 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground'
                              : sale.status === 'completed'
                              ? 'bg-success-bg dark:bg-success-bg text-success dark:text-success'
                              : 'bg-warning-bg dark:bg-warning-bg text-warning dark:text-warning'
                          }`}
                        >
                          {isVoid ? (
                            <>
                              <Slash className="w-3 h-3" />
                              {isAr ? 'ملغى' : 'Void'}
                            </>
                          ) : sale.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              {isAr ? 'مكتمل' : 'Completed'}
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              {sale.status}
                            </>
                          )}
                        </span>
                      </td>

                      {/* Date & Recorded By */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-foreground">{dateFormatted}</div>
                        <div className="text-muted-foreground dark:text-muted-foreground">
                          {sale.profiles?.full_name || 'System'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {sale.attachment_url && (
                            <AdminDocumentLink
                              path={sale.attachment_url}
                              label={isAr ? 'عرض المستند' : 'View Document'}
                              getSignedUrlAction={getSaleSignedUrl}
                            />
                          )}
                          {!isVoid && (
                            <button
                              onClick={() => handleVoid(sale.id)}
                              disabled={isPending}
                              title={isAr ? 'إلغاء / أرشفة المعاملة' : 'Void transaction'}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-bg dark:hover:bg-error-bg/30 transition-colors"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border-subtle">
            <AdminPagination total={total} perPage={25} dir={isAr ? 'rtl' : 'ltr'} />
          </div>
        </div>
      )}
    </div>
  )
}
