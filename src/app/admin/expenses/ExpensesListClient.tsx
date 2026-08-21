'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { archiveAdminExpense, getExpenseSignedUrl } from '@/app/actions/adminExpenses.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { AdminDocumentLink } from '@/components/admin/ui/AdminDocumentLink'
import {
  Receipt,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  DollarSign,
} from 'lucide-react'
import type { Tables } from '@/types/database.types'

interface ExpenseWithRelations extends Tables<'expenses'> {
  expense_categories?: { id: string; name_en: string; name_ar: string } | null
  profiles?: { full_name: string; email: string } | null
}

interface Props {
  expenses: ExpenseWithRelations[]
  total: number
  totalAmount: number
  categories: Tables<'expense_categories'>[]
  currentPage?: number
  currentQ?: string
  currentCategoryId?: string
  currentPaymentMethod?: string
  currentFromDate?: string
  currentToDate?: string
  includeArchived?: boolean
}

export function ExpensesListClient({
  expenses: initialExpenses,
  total,
  totalAmount,
  categories,
  currentCategoryId = 'all',
  currentPaymentMethod = 'all',
  currentFromDate = '',
  currentToDate = '',
  includeArchived = false,
}: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [isPending, startTransition] = useTransition()

  const isAr = lang === 'ar'

  function handleArchiveToggle(expense: ExpenseWithRelations) {
    const nextState = !expense.is_archived
    const confirmMsg = nextState
      ? isAr
        ? 'هل أنت متأكد من أرشفة هذا المصروف؟'
        : 'Are you sure you want to archive this expense?'
      : isAr
      ? 'هل أنت متأكد من استعادة هذا المصروف؟'
      : 'Are you sure you want to restore this expense?'

    if (!confirm(confirmMsg)) return

    startTransition(async () => {
      const res = await archiveAdminExpense(expense.id, nextState)
      if (res.success) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === expense.id ? { ...e, is_archived: nextState } : e))
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
    router.push(`/admin/expenses?${searchParams.toString()}`)
  }

  const paymentMethods = [
    { value: 'all', labelEn: 'All Methods', labelAr: 'كل طرق الدفع' },
    { value: 'card', labelEn: 'Card', labelAr: 'بطاقة' },
    { value: 'cash', labelEn: 'Cash', labelAr: 'نقدي' },
    { value: 'bank_transfer', labelEn: 'Bank Transfer', labelAr: 'تحويل بنكي' },
    { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2a2118]">
            {isAr ? 'إدارة المصروفات' : 'Expenses Management'}
          </h1>
          <p className="text-xs text-[#7a6a57] mt-0.5">
            {isAr
              ? 'سجل النفقات والمصروفات التشغيلية للمركز'
              : 'Ledger of operational expenditures and center outflows'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/expenses/categories"
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#e8ddd0] bg-white text-[#7a6a57] hover:bg-[#f5ede0] hover:text-[#2a2118] transition-colors"
          >
            {isAr ? 'التصنيفات' : 'Categories'}
          </Link>
          <Link
            href="/admin/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2118] text-white text-sm font-medium hover:bg-[#3a3128] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'تسجيل مصروف' : 'Record Expense'}</span>
          </Link>
        </div>
      </div>

      {/* KPI / Total Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#f5ede0] flex items-center justify-center text-[#c9a96e]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a8a7a]">
              {isAr ? 'إجمالي المصروفات المعروضة' : 'Total Filtered Expenses'}
            </p>
            <p className="text-lg font-bold text-[#2a2118]">
              {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#f5ede0] flex items-center justify-center text-[#c9a96e]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a8a7a]">
              {isAr ? 'عدد العمليات' : 'Total Records'}
            </p>
            <p className="text-lg font-bold text-[#2a2118]">{total}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] p-4 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <AdminSearchBar
              placeholder={isAr ? 'البحث بالوصف أو المرجع أو الملاحظات…' : 'Search description, reference, notes…'}
              paramName="q"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={currentCategoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#e8ddd0] bg-[#faf7f4] text-xs font-medium text-[#2a2118] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
            >
              <option value="all">{isAr ? 'كل التصنيفات' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={currentPaymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#e8ddd0] bg-[#faf7f4] text-xs font-medium text-[#2a2118] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {isAr ? m.labelAr : m.labelEn}
                </option>
              ))}
            </select>

            {/* Date from */}
            <div className="flex items-center gap-1.5 bg-[#faf7f4] px-2.5 py-1.5 rounded-xl border border-[#e8ddd0]">
              <span className="text-[11px] text-[#9a8a7a]">{isAr ? 'من:' : 'From:'}</span>
              <input
                type="date"
                defaultValue={currentFromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="bg-transparent text-xs text-[#2a2118] focus:outline-none"
              />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1.5 bg-[#faf7f4] px-2.5 py-1.5 rounded-xl border border-[#e8ddd0]">
              <span className="text-[11px] text-[#9a8a7a]">{isAr ? 'إلى:' : 'To:'}</span>
              <input
                type="date"
                defaultValue={currentToDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="bg-transparent text-xs text-[#2a2118] focus:outline-none"
              />
            </div>

            {/* Include Archived toggle */}
            <button
              type="button"
              onClick={() => handleFilterChange('archived', includeArchived ? '' : 'true')}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                includeArchived
                  ? 'bg-[#2a2118] text-white border-[#2a2118]'
                  : 'bg-[#faf7f4] text-[#7a6a57] border-[#e8ddd0] hover:bg-[#f5ede0]'
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
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden shadow-sm">
        {expenses.length === 0 ? (
          <AdminEmptyState
            icon={<Receipt className="w-6 h-6 text-[#9a8a7a]" />}
            title={isAr ? 'لا توجد مصروفات مطابقة' : 'No expenses found'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'التاريخ / المرجع' : 'Date / Ref'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'التصنيف' : 'Category'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'الوصف' : 'Description'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'طريقة الدفع' : 'Payment'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'المستند' : 'Document'}
                  </th>
                  <th className="text-end px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-[#faf7f4] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2a2118]">{e.date}</p>
                      <p className="text-[11px] font-mono text-[#9a8a7a]">{e.reference || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#faf7f4] border border-[#e8ddd0] text-xs text-[#7a6a57]">
                        {isAr
                          ? e.expense_categories?.name_ar || '—'
                          : e.expense_categories?.name_en || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2a2118] max-w-xs truncate">{e.description}</p>
                      {e.notes && (
                        <p className="text-xs text-[#9a8a7a] max-w-xs truncate">{e.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#7a6a57] capitalize">
                      {e.payment_method.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2a2118] whitespace-nowrap">
                      {Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                    </td>
                    <td className="px-4 py-3">
                      {e.attachment_url ? (
                        <AdminDocumentLink
                          path={e.attachment_url}
                          label={isAr ? 'معاينة' : 'Doc'}
                          getSignedUrlAction={getExpenseSignedUrl}
                        />
                      ) : (
                        <span className="text-xs text-[#9a8a7a]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/expenses/${e.id}/edit`}
                          className="p-1.5 rounded-lg text-[#7a6a57] hover:text-[#2a2118] hover:bg-[#f5ede0] transition-colors"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleArchiveToggle(e)}
                          disabled={isPending}
                          className={`p-1.5 rounded-lg transition-colors ${
                            e.is_archived
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={
                            e.is_archived
                              ? isAr
                                ? 'استعادة'
                                : 'Restore'
                              : isAr
                              ? 'أرشفة'
                              : 'Archive'
                          }
                        >
                          {e.is_archived ? (
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
