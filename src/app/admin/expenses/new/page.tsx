import type { Metadata } from 'next'
import { getAdminExpenseCategories } from '@/app/actions/adminExpenseCategories.actions'
import { ExpenseForm } from '../ExpenseForm'

export const metadata: Metadata = {
  title: 'Record Expense | SANO LUNA Admin',
}

export default async function NewExpensePage() {
  const categories = await getAdminExpenseCategories(false)

  return <ExpenseForm categories={categories} />
}
