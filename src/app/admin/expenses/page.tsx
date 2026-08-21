import type { Metadata } from 'next'
import { getAdminExpenses } from '@/app/actions/adminExpenses.actions'
import { getAdminExpenseCategories } from '@/app/actions/adminExpenseCategories.actions'
import { ExpensesListClient } from './ExpensesListClient'

export const metadata: Metadata = {
  title: 'Expenses | SANO LUNA Admin',
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const q = sp.q
  const categoryId = sp.categoryId
  const paymentMethod = sp.paymentMethod
  const fromDate = sp.fromDate
  const toDate = sp.toDate
  const includeArchived = sp.archived === 'true'

  const [{ expenses, total, totalAmount }, categories] = await Promise.all([
    getAdminExpenses({
      page,
      q,
      categoryId,
      paymentMethod,
      fromDate,
      toDate,
      includeArchived,
    }),
    getAdminExpenseCategories(true),
  ])

  return (
    <ExpensesListClient
      expenses={expenses}
      total={total}
      totalAmount={totalAmount}
      categories={categories}
      currentPage={page}
      currentQ={q}
      currentCategoryId={categoryId}
      currentPaymentMethod={paymentMethod}
      currentFromDate={fromDate}
      currentToDate={toDate}
      includeArchived={includeArchived}
    />
  )
}
