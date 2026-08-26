'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { createAdminPackage, updateAdminPackage } from '@/app/actions/adminPackages.actions'
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { AdminImageUpload } from '@/components/admin/ui/AdminImageUpload'

interface ServiceOption {
  id: string
  name_en: string
  name_ar: string
}

export interface PackageData {
  id?: string
  slug: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  price_sar: number
  total_duration_minutes: number
  is_active: boolean
  image_url: string | null
  package_services?: { service_id: string; sequence_order: number }[]
}

interface Props {
  initialData?: PackageData
  availableServices: ServiceOption[]
}

export function PackageForm({ initialData, availableServices }: Props) {
  const { lang, t } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [packageServices, setPackageServices] = useState<{ id: string; service_id: string }[]>(
    (initialData?.package_services || []).sort((a, b) => a.sequence_order - b.sequence_order).map((s, idx) => ({ id: `${idx}-${s.service_id}`, service_id: s.service_id }))
  )

  const isAr = lang === 'ar'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Add package_services as JSON
    const servicesPayload = packageServices.map((ps, index) => ({
      service_id: ps.service_id,
      sequence_order: index + 1
    }))
    formData.set('services', JSON.stringify(servicesPayload))

    startTransition(async () => {
      try {
        let result
        if (initialData?.id) {
          result = await updateAdminPackage(initialData.id, formData)
        } else {
          result = await createAdminPackage(formData)
        }
        
        if (result.error) {
          setError(result.error)
        } else {
          router.push('/admin/packages')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  function addService() {
    setPackageServices([...packageServices, { id: Date.now().toString(), service_id: availableServices[0]?.id || '' }])
  }

  function removeService(idToRemove: string) {
    setPackageServices(packageServices.filter(ps => ps.id !== idToRemove))
  }

  function updateServiceId(idToUpdate: string, newServiceId: string) {
    setPackageServices(packageServices.map(ps => ps.id === idToUpdate ? { ...ps, service_id: newServiceId } : ps))
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            href="/admin/packages" 
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t.common.cancel}
          </Link>
          <h1 className="text-2xl font-bold mt-4">
            {initialData ? t.packages.edit : t.packages.new}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold">{t.common.all}</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name_en" className="text-sm font-medium">
                    {t.packages.nameEn} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name_en"
                    name="name_en"
                    required
                    defaultValue={initialData?.name_en}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="name_ar" className="text-sm font-medium">
                    {t.packages.nameAr} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name_ar"
                    name="name_ar"
                    required
                    dir="rtl"
                    defaultValue={initialData?.name_ar}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="slug" className="text-sm font-medium">
                    {t.services.slug} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    required
                    defaultValue={initialData?.slug}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description_en" className="text-sm font-medium">
                    {t.packages.descEn}
                  </label>
                  <textarea
                    id="description_en"
                    name="description_en"
                    rows={3}
                    defaultValue={initialData?.description_en}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description_ar" className="text-sm font-medium">
                    {t.packages.descAr}
                  </label>
                  <textarea
                    id="description_ar"
                    name="description_ar"
                    rows={3}
                    dir="rtl"
                    defaultValue={initialData?.description_ar}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Included Services */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t.services.title}</h2>
                <button
                  type="button"
                  onClick={addService}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {packageServices.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg text-center border border-dashed">
                  {isAr ? 'لم تتم إضافة أي خدمات إلى هذه الباقة بعد.' : 'No services added to this package yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {packageServices.map((ps, index) => (
                    <div key={ps.id} className="flex items-center gap-3 bg-background border rounded-lg p-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab opacity-50" />
                      <span className="text-xs font-medium text-muted-foreground w-4 text-center">{index + 1}</span>
                      <div className="flex-1">
                        <select
                          value={ps.service_id}
                          onChange={(e) => updateServiceId(ps.id, e.target.value)}
                          className="w-full text-sm bg-transparent outline-none focus:ring-2 rounded focus:ring-ring"
                        >
                          <option value="" disabled>{isAr ? 'اختر خدمة' : 'Select a service'}</option>
                          {availableServices.map(srv => (
                            <option key={srv.id} value={srv.id}>
                              {isAr ? srv.name_ar : srv.name_en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeService(ps.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold">{t.common.filters}</h2>
              
              <div className="space-y-2">
                <label htmlFor="price_sar" className="text-sm font-medium">
                  {t.packages.price} <span className="text-destructive">*</span>
                </label>
                <input
                  id="price_sar"
                  name="price_sar"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={initialData?.price_sar}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="total_duration_minutes" className="text-sm font-medium">
                  {t.services.duration} <span className="text-destructive">*</span>
                </label>
                <input
                  id="total_duration_minutes"
                  name="total_duration_minutes"
                  type="number"
                  min="1"
                  required
                  defaultValue={initialData?.total_duration_minutes}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={initialData?.is_active ?? true}
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium">{t.packages.active}</span>
                </label>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold">{t.media.uploadImage}</h2>
              <AdminImageUpload
                entityId={initialData?.id || 'new'}
                imageUrl={initialData?.image_url ?? null}
                onUpload={async () => ({ success: false, error: 'Not implemented' })}
                onRemove={async () => ({ success: false, error: 'Not implemented' })}
                t={t}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            href="/admin/packages"
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent"
          >
            {t.common.cancel}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.packages.save}
          </button>
        </div>
      </form>
    </div>
  )
}
