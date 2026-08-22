'use client'

import { useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { CustomerFormDialog } from './CustomerFormDialog'
import type { AdminDir } from '@/lib/admin/translations'

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

interface CustomerFormWrapperProps {
  t: FormTranslations
  dir: AdminDir
  customer?: {
    id: string
    full_name: string
    phone: string
    email: string | null
  }
  variant?: 'button' | 'icon'
}

export function CustomerFormWrapper({ t, dir, customer, variant = 'button' }: CustomerFormWrapperProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-[#3a3128] transition-colors"
        >
          {customer ? (
            <>
              <Edit2 className="w-4 h-4" />
              {t.common.edit}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t.customers.title} {/* Using title for "Customers" or we could use a generic "Add" */}
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#9a8a7a] hover:text-foreground hover:bg-[#f5ede0] rounded-lg transition-colors"
          title={t.common.edit}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      <CustomerFormDialog
        open={open}
        onClose={() => setOpen(false)}
        t={t}
        dir={dir}
        customer={customer}
      />
    </>
  )
}
