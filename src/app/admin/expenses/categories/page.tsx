import type { Metadata } from 'next'
import { getAdminExpenseCategories } from '@/app/actions/adminExpenseCategories.actions'
import { ExpenseCategoriesClient } from './ExpenseCategoriesClient'

export const metadata: Metadata = {
  title: 'Expense Categories | SANO LUNA Admin',
}

export default async function ExpenseCategoriesPage() {
  const categories = await getAdminExpenseCategories(true)

  return <ExpenseCategoriesClient initialCategories={categories} />
}
