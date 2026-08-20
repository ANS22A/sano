'use client'

import { useTransition, useState, useEffect } from 'react'
import { createAdminStaff, updateAdminStaff, uploadStaffImage, removeStaffImage } from '@/app/actions/adminStaff.actions'
import type { AdminDir } from '@/lib/admin/translations'
import { useRouter } from 'next/navigation'
import { AdminImageUpload } from '@/components/admin/ui/AdminImageUpload'

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

interface StaffFormDialogProps {
  open: boolean
  onClose: () => void
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
}

export function StaffFormDialog({ open, onClose, t, staff }: StaffFormDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    bio_en: '',
    bio_ar: '',
    slug: '',
    image_url: ''
  })

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name_en: staff?.name_en ?? '',
        name_ar: staff?.name_ar ?? '',
        bio_en: staff?.bio_en ?? '',
        bio_ar: staff?.bio_ar ?? '',
        slug: staff?.slug ?? '',
        image_url: staff?.image_url ?? ''
      })
      setError(null)
    }
  }, [open, staff])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    
    const fd = new FormData()
    fd.set('name_en', formData.name_en)
    fd.set('name_ar', formData.name_ar)
    fd.set('bio_en', formData.bio_en)
    fd.set('bio_ar', formData.bio_ar)
    fd.set('slug', formData.slug)
    fd.set('image_url', formData.image_url)

    startTransition(async () => {
      const result = staff?.id 
        ? await updateAdminStaff(staff.id, fd)
        : await createAdminStaff(fd)
        
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a2118]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-dialog-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#f0e8de] flex items-center justify-between">
          <h3 id="staff-dialog-title" className="text-base font-bold text-[#2a2118]">
            {staff ? t.common.edit : `${t.staff.title} +`}
          </h3>
          <button 
            onClick={onClose}
            className="text-[#9a8a7a] hover:text-[#2a2118] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name_en" className="block text-sm font-medium text-[#2a2118] mb-1">Name (EN) *</label>
              <input
                id="name_en"
                name="name_en"
                type="text"
                required
                className="w-full p-2.5 rounded-xl border border-[#e8ddd0] bg-white text-[#2a2118] outline-none focus:border-[#c9a96e]"
                value={formData.name_en}
                onChange={handleChange}
                dir="ltr"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="name_ar" className="block text-sm font-medium text-[#2a2118] mb-1 text-right">Name (AR) *</label>
              <input
                id="name_ar"
                name="name_ar"
                type="text"
                required
                className="w-full p-2.5 rounded-xl border border-[#e8ddd0] bg-white text-[#2a2118] outline-none focus:border-[#c9a96e]"
                value={formData.name_ar}
                onChange={handleChange}
                dir="rtl"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-[#2a2118] mb-1">Slug *</label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                className="w-full p-2.5 rounded-xl border border-[#e8ddd0] bg-white text-[#2a2118] outline-none focus:border-[#c9a96e] font-mono text-sm"
                value={formData.slug}
                onChange={handleChange}
                dir="ltr"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="bio_en" className="block text-sm font-medium text-[#2a2118] mb-1">Bio (EN)</label>
              <textarea
                id="bio_en"
                name="bio_en"
                rows={2}
                className="w-full p-2.5 rounded-xl border border-[#e8ddd0] bg-white text-[#2a2118] outline-none focus:border-[#c9a96e]"
                value={formData.bio_en}
                onChange={handleChange}
                dir="ltr"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="bio_ar" className="block text-sm font-medium text-[#2a2118] mb-1 text-right">Bio (AR)</label>
              <textarea
                id="bio_ar"
                name="bio_ar"
                rows={2}
                className="w-full p-2.5 rounded-xl border border-[#e8ddd0] bg-white text-[#2a2118] outline-none focus:border-[#c9a96e]"
                value={formData.bio_ar}
                onChange={handleChange}
                dir="rtl"
                disabled={isPending}
              />
            </div>

            {staff?.id && (
              <div>
                <label className="block text-sm font-medium text-[#2a2118] mb-3">Staff Image</label>
                <AdminImageUpload
                  entityId={staff.id}
                  imageUrl={staff.image_url ?? null}
                  onUpload={uploadStaffImage}
                  onRemove={removeStaffImage}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  t={t as any}
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#f0e8de] flex justify-end gap-3 bg-[#faf7f4]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#7a6a57] hover:bg-white hover:text-[#2a2118] transition-colors border border-transparent hover:border-[#e8ddd0] disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-xl text-sm font-medium bg-[#2a2118] text-white hover:bg-[#1a1412] transition-colors disabled:opacity-50"
            >
              {isPending ? t.common.saving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
