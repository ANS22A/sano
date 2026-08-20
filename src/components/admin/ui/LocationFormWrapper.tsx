'use client'

import { useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { LocationFormDialog } from './LocationFormDialog'
import type { AdminDir } from '@/lib/admin/translations'

interface FormTranslations {
  common: {
    edit: string
    cancel: string
    saving: string
    save: string
    error: string
    active: string
    inactive: string
  }
  locations: {
    title: string
  }
}

interface LocationFormWrapperProps {
  t: FormTranslations
  dir: AdminDir
  location?: {
    id: string
    name_en: string
    name_ar: string
    address_en: string
    address_ar: string
    phone: string | null
    slug: string
    latitude: number | null
    longitude: number | null
    is_active: boolean
  }
  variant?: 'button' | 'icon'
}

export function LocationFormWrapper({ t, dir, location, variant = 'button' }: LocationFormWrapperProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-white text-sm font-medium rounded-xl hover:bg-[#3a3128] transition-colors"
        >
          {location ? (
            <>
              <Edit2 className="w-4 h-4" />
              {t.common.edit}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t.locations.title}
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#9a8a7a] hover:text-[#2a2118] hover:bg-[#f5ede0] rounded-lg transition-colors"
          title={t.common.edit}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      <LocationFormDialog
        open={open}
        onClose={() => setOpen(false)}
        t={t}
        dir={dir}
        location={location}
      />
    </>
  )
}
