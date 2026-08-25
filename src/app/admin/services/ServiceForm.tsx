'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminService, updateAdminService, toggleServiceActive, uploadServiceImage, removeServiceImage } from '@/app/actions/adminServices.actions'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { AdminImageUpload } from '@/components/admin/ui/AdminImageUpload'

interface ServiceFormProps {
  service?: {
    id: string
    name_ar: string
    name_en: string
    slug: string
    category_id: string | null
    price_sar: number
    duration_minutes: number
    sort_order?: number | null
    is_active: boolean
    is_featured: boolean
    short_description_ar?: string | null
    short_description_en?: string | null
    image_url?: string | null
  }
  categories: { id: string; name_en: string; name_ar: string }[]
  isEdit?: boolean
}

export function ServiceForm({ service, categories, isEdit }: ServiceFormProps) {
  const { t } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = isEdit && service
        ? await updateAdminService(service.id, fd)
        : await createAdminService(fd)
      if (result?.error) {
        alert(result.error)
      } else {
        router.push('/admin/services')
      }
    })
  }

  function handleToggleActive() {
    if (!service) return
    startTransition(async () => {
      await toggleServiceActive(service.id, !service.is_active)
      router.refresh()
    })
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'
  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1.5'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {isEdit ? t.services.edit : t.services.new}
        </h1>
        {isEdit && service && (
          <button
            onClick={handleToggleActive}
            disabled={isPending}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              service.is_active
                ? 'border-error-border text-error hover:bg-error-bg'
                : 'border-success-border text-success hover:bg-success-bg'
            }`}
          >
            {service.is_active ? t.services.deactivate : t.services.activate}
          </button>
        )}
      </div>

      {isEdit && service && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Service Image</h2>
          <AdminImageUpload
            entityId={service.id}
            imageUrl={service.image_url ?? null}
            onUpload={uploadServiceImage}
            onRemove={removeServiceImage}
            t={t}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t.services.nameEn} *</label>
            <input name="name_en" defaultValue={service?.name_en} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.services.nameAr} *</label>
            <input name="name_ar" defaultValue={service?.name_ar} required dir="rtl" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t.services.slug} *</label>
            <input name="slug" defaultValue={service?.slug} required pattern="[a-z0-9-]+" className={inputCls} placeholder="e.g. swedish-massage" />
          </div>
          <div>
            <label className={labelCls}>Sort Order / الترتيب</label>
            <input name="sort_order" type="number" min="0" step="1" defaultValue={service?.sort_order ?? 0} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{t.services.category}</label>
            <select name="category_id" defaultValue={service?.category_id ?? ''} className={inputCls}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.services.price} *</label>
            <input name="price_sar" type="number" min="0" step="0.01" defaultValue={service?.price_sar} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.services.duration} *</label>
            <input name="duration_minutes" type="number" min="15" step="15" defaultValue={service?.duration_minutes} required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Short Description (EN)</label>
          <textarea name="short_description_en" defaultValue={service?.short_description_en ?? ''} rows={2} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Short Description (AR)</label>
          <textarea name="short_description_ar" defaultValue={service?.short_description_ar ?? ''} rows={2} dir="rtl" className={inputCls} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input name="is_active" type="checkbox" defaultChecked={service?.is_active ?? true} value="true" className="w-4 h-4 rounded accent-accent" />
            <span className="text-sm text-foreground">{t.services.active}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input name="is_featured" type="checkbox" defaultChecked={service?.is_featured ?? false} value="true" className="w-4 h-4 rounded accent-accent" />
            <span className="text-sm text-foreground">{t.services.featured}</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {isPending ? t.services.saving : t.services.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            {t.common.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}
