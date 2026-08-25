'use client'

import { useTransition, useState, useEffect } from 'react'
import { createAdminCustomer, updateAdminCustomer } from '@/app/actions/adminCustomers.actions'
import type { AdminDir } from '@/lib/admin/translations'
import { useRouter } from 'next/navigation'

interface FormTranslations {
  common: {
    edit: string
    cancel: string
    saving: string
    save: string
  }
  customers: {
    title: string
    name: string
    phone: string
    email: string
  }
}

interface CustomerFormDialogProps {
  open: boolean
  onClose: () => void
  t: FormTranslations
  dir: AdminDir
  customer?: {
    id: string
    full_name: string
    phone: string
    email: string | null
  }
}

export function CustomerFormDialog({ open, onClose, t, dir, customer }: CustomerFormDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Local state for controlled inputs
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        full_name: customer?.full_name ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? ''
      })
      setError(null)
    }
  }, [open, customer])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      let result
      if (customer) {
        result = await updateAdminCustomer(customer.id, fd)
      } else {
        result = await createAdminCustomer(fd)
      }

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isPending && onClose()}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {customer ? t.common.edit : t.customers.title}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 text-sm text-error bg-error-bg rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t.customers.name} *
            </label>
            <input
              name="full_name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-white text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
              placeholder="Full Name"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t.customers.phone} *
            </label>
            <input
              name="phone"
              required
              dir="ltr"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-white text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-start"
              placeholder="05X XXX XXXX"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t.customers.email}
            </label>
            <input
              name="email"
              type="email"
              dir="ltr"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-white text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-start"
              placeholder="email@example.com"
              disabled={isPending}
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground border border-border hover:bg-surface-muted transition-colors disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? t.common.saving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
