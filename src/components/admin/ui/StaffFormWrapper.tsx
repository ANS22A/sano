'use client'

import { useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { StaffFormDialog } from './StaffFormDialog'
import type { AdminDir } from '@/lib/admin/translations'

interface FormTranslations {
  common: {
    edit: string
    cancel: string
    saving: string
    save: string
    error: string
  }
  staff: {
    title: string
  }
}

interface StaffFormWrapperProps {
  t: FormTranslations
  dir: AdminDir
  staff?: {
    id: string
    name_en: string
    name_ar: string
    bio_en: string
    bio_ar: string
    slug: string
    image_url: string | null
  }
  variant?: 'button' | 'icon'
}

export function StaffFormWrapper({ t, dir, staff, variant = 'button' }: StaffFormWrapperProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-[#3a3128] transition-colors"
        >
          {staff ? (
            <>
              <Edit2 className="w-4 h-4" />
              {t.common.edit}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t.staff.title}
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

      <StaffFormDialog
        open={open}
        onClose={() => setOpen(false)}
        t={t}
        dir={dir}
        staff={staff}
      />
    </>
  )
}
