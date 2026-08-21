import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminExpenseById } from '@/app/actions/adminExpenses.actions'
import { getAdminExpenseCategories } from '@/app/actions/adminExpenseCategories.actions'
import { ExpenseForm } from '../../ExpenseForm'

export const metadata: Metadata = {
  title: 'Edit Expense | SANO LUNA Admin',
}

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [expense, categories] = await Promise.all([
    getAdminExpenseById(id),
    getAdminExpenseCategories(true),
  ])

  if (!expense) {
    notFound()
  }

  return <ExpenseForm expense={expense} categories={categories} isEdit />
}
