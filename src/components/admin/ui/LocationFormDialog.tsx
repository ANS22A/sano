'use client'

import { useTransition, useState, useEffect } from 'react'
import { createAdminLocation, updateAdminLocation } from '@/app/actions/adminLocations.actions'
import type { AdminDir } from '@/lib/admin/translations'
import { useRouter } from 'next/navigation'

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

interface LocationFormDialogProps {
  open: boolean
  onClose: () => void
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
}

export function LocationFormDialog({ open, onClose, t, dir, location }: LocationFormDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    address_en: '',
    address_ar: '',
    phone: '',
    slug: '',
    latitude: '',
    longitude: '',
    is_active: true
  })

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name_en: location?.name_en ?? '',
        name_ar: location?.name_ar ?? '',
        address_en: location?.address_en ?? '',
        address_ar: location?.address_ar ?? '',
        phone: location?.phone ?? '',
        slug: location?.slug ?? '',
        latitude: location?.latitude?.toString() ?? '',
        longitude: location?.longitude?.toString() ?? '',
        is_active: location?.is_active ?? true
      })
      setError(null)
    }
  }, [open, location])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    
    const fd = new FormData()
    fd.set('name_en', formData.name_en)
    fd.set('name_ar', formData.name_ar)
    fd.set('address_en', formData.address_en)
    fd.set('address_ar', formData.address_ar)
    if (formData.phone) fd.set('phone', formData.phone)
    fd.set('slug', formData.slug)
    if (formData.latitude) fd.set('latitude', formData.latitude)
    if (formData.longitude) fd.set('longitude', formData.longitude)
    fd.set('is_active', String(formData.is_active))

    startTransition(async () => {
      const result = location?.id 
        ? await updateAdminLocation(location.id, fd)
        : await createAdminLocation(fd)
        
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-dialog-title"
    >
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 id="location-dialog-title" className="text-lg font-heading font-bold text-foreground">
            {location ? t.common.edit : `${t.locations.title} +`}
          </h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-error-bg text-error rounded-lg text-sm border border-error-border" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name_en" className="block text-sm font-medium text-foreground mb-1">{dir === 'rtl' ? 'الاسم (EN) *' : 'Name (EN) *'}</label>
                <input
                  id="name_en"
                  name="name_en"
                  type="text"
                  required
                  className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent"
                  value={formData.name_en}
                  onChange={handleChange}
                  dir="ltr"
                  disabled={isPending}
                />
              </div>

              <div>
                <label htmlFor="name_ar" className="block text-sm font-medium text-foreground mb-1 text-start">{dir === 'rtl' ? 'الاسم (AR) *' : 'Name (AR) *'}</label>
                <input
                  id="name_ar"
                  name="name_ar"
                  type="text"
                  required
                  className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent"
                  value={formData.name_ar}
                  onChange={handleChange}
                  dir="rtl"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1">{dir === 'rtl' ? 'المعرف (Slug) *' : 'Slug *'}</label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent font-mono text-sm"
                  value={formData.slug}
                  onChange={handleChange}
                  dir="ltr"
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">{dir === 'rtl' ? 'الهاتف' : 'Phone'}</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent"
                  value={formData.phone}
                  onChange={handleChange}
                  dir="ltr"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address_en" className="block text-sm font-medium text-foreground mb-1">{dir === 'rtl' ? 'العنوان (EN)' : 'Address (EN)'}</label>
              <textarea
                id="address_en"
                name="address_en"
                rows={2}
                className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent"
                value={formData.address_en}
                onChange={handleChange}
                dir="ltr"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="address_ar" className="block text-sm font-medium text-foreground mb-1 text-start">{dir === 'rtl' ? 'العنوان (AR)' : 'Address (AR)'}</label>
              <textarea
                id="address_ar"
                name="address_ar"
                rows={2}
                className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent"
                value={formData.address_ar}
                onChange={handleChange}
                dir="rtl"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-foreground mb-1">{dir === 'rtl' ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent font-mono text-sm"
                  value={formData.latitude}
                  onChange={handleChange}
                  dir="ltr"
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-foreground mb-1">{dir === 'rtl' ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  className="w-full p-2.5 rounded-xl border border-border bg-white text-foreground outline-none focus:border-accent font-mono text-sm"
                  value={formData.longitude}
                  onChange={handleChange}
                  dir="ltr"
                  disabled={isPending}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={isPending}
                className="w-4 h-4 rounded border-border text-foreground focus:ring-accent"
              />
              <span className="text-sm font-medium text-foreground">
                {formData.is_active ? t.common.active : t.common.inactive}
              </span>
            </label>

          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-surface-muted hover:bg-surface-elevated transition-colors border border-border disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center min-w-[100px] px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                location ? t.common.save : t.common.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
