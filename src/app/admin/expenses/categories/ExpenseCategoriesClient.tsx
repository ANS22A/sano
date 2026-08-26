'use client'

import { useState, useTransition } from 'react'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import {
  createAdminExpenseCategory,
  updateAdminExpenseCategory,
  archiveAdminExpenseCategory,
} from '@/app/actions/adminExpenseCategories.actions'
import { Plus, Tag, Edit2, Archive, RotateCcw, Loader2 } from 'lucide-react'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import type { Tables } from '@/types/database.types'

type Category = Tables<'expense_categories'>

interface Props {
  initialCategories: Category[]
}

export function ExpenseCategoriesClient({ initialCategories }: Props) {
  const { lang } = useAdmin()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const isAr = lang === 'ar'

  function openCreate() {
    setEditingCategory(null)
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat)
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      if (editingCategory) {
        const res = await updateAdminExpenseCategory(editingCategory.id, formData)
        if (res.success && res.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? res.category! : c))
          )
          setShowModal(false)
        } else {
          alert(res.error || 'Failed to update category')
        }
      } else {
        const res = await createAdminExpenseCategory(formData)
        if (res.success && res.category) {
          setCategories((prev) => [...prev, res.category!])
          setShowModal(false)
        } else {
          alert(res.error || 'Failed to create category')
        }
      }
    })
  }

  function handleArchiveToggle(cat: Category) {
    const nextState = !cat.is_archived
    const confirmMsg = nextState
      ? isAr
        ? 'هل أنت متأكد من أرشفة هذا التصنيف؟'
        : 'Are you sure you want to archive this category?'
      : isAr
      ? 'هل أنت متأكد من استعادة هذا التصنيف؟'
      : 'Are you sure you want to restore this category?'

    if (!confirm(confirmMsg)) return

    startTransition(async () => {
      const res = await archiveAdminExpenseCategory(cat.id, nextState)
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, is_archived: nextState } : c))
        )
      } else {
        alert(res.error || 'Operation failed')
      }
    })
  }

  const displayed = categories.filter((c) => (showArchived ? true : !c.is_archived))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isAr ? 'تصنيفات المصروفات' : 'Expense Categories'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? 'إدارة التصنيفات التشغيلية للمصروفات والنفقات'
              : 'Manage operational taxonomy for expenses and outflows'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              showArchived
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
            }`}
          >
            {showArchived
              ? isAr
                ? 'إخفاء المؤرشف'
                : 'Hide Archived'
              : isAr
              ? 'عرض المؤرشف'
              : 'Show Archived'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة تصنيف' : 'New Category'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        {displayed.length === 0 ? (
          <AdminEmptyState
            icon={<Tag className="w-6 h-6 text-muted-foreground" />}
            title={isAr ? 'لا توجد تصنيفات' : 'No expense categories found'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الاسم (إنجليزي)' : 'English Name'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الاسم (عربي)' : 'Arabic Name'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-end px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {isAr ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {displayed.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{cat.name_en}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat.name_ar}</td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={cat.is_archived ? 'inactive' : 'active'}
                        label={
                          cat.is_archived
                            ? isAr
                              ? 'مؤرشف'
                              : 'Archived'
                            : isAr
                            ? 'نشط'
                            : 'Active'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveToggle(cat)}
                          disabled={isPending}
                          className={`p-1.5 rounded-lg transition-colors ${
                            cat.is_archived
                              ? 'text-success hover:bg-success-bg'
                              : 'text-warning hover:bg-warning-bg'
                          }`}
                          title={
                            cat.is_archived
                              ? isAr
                                ? 'استعادة'
                                : 'Restore'
                              : isAr
                              ? 'أرشفة'
                              : 'Archive'
                          }
                        >
                          {cat.is_archived ? (
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-md p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                {editingCategory
                  ? isAr
                    ? 'تعديل التصنيف'
                    : 'Edit Category'
                  : isAr
                  ? 'إضافة تصنيف جديد'
                  : 'New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {isAr ? 'الاسم بالإنجليزية' : 'English Name'} *
                </label>
                <input
                  type="text"
                  name="name_en"
                  required
                  defaultValue={editingCategory?.name_en || ''}
                  placeholder="e.g. Utilities, Marketing, Rent"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {isAr ? 'الاسم بالعربية' : 'Arabic Name'} *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  required
                  defaultValue={editingCategory?.name_ar || ''}
                  placeholder="مثال: الخدمات والمرافق، التسويق، الإيجار"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-surface transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
