'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminPackage, updateAdminPackage } from '@/app/actions/adminPackages.actions'

export function PackageForm({ 
  initialData, 
  services 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any,
  services: { id: string, name_en: string, name_ar: string }[]
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [selectedServices, setSelectedServices] = useState<{service_id: string, sequence_order: number}[]>(
    initialData?.package_services?.map((ps: { service_id: string, sequence_order: number }) => ({
      service_id: ps.service_id,
      sequence_order: ps.sequence_order
    })) || []
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('services', JSON.stringify(selectedServices))

    const res = initialData 
      ? await updateAdminPackage(initialData.id, formData)
      : await createAdminPackage(formData)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/admin/packages')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Slug (Unique)*</label>
          <input required name="slug" defaultValue={initialData?.slug} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input name="image_url" defaultValue={initialData?.image_url} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name (English)*</label>
          <input required name="name_en" defaultValue={initialData?.name_en} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name (Arabic)*</label>
          <input required name="name_ar" defaultValue={initialData?.name_ar} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (SAR)*</label>
          <input required type="number" step="0.01" name="price_sar" defaultValue={initialData?.price_sar} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (Minutes)*</label>
          <input required type="number" name="total_duration_minutes" defaultValue={initialData?.total_duration_minutes} className="w-full border rounded p-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description (English)</label>
          <textarea name="description_en" defaultValue={initialData?.description_en} className="w-full border rounded p-2 h-24" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
          <textarea name="description_ar" defaultValue={initialData?.description_ar} className="w-full border rounded p-2 h-24" dir="rtl" />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input type="hidden" name="is_active" value="false" />
          <input type="checkbox" name="is_active" value="true" defaultChecked={initialData?.is_active ?? true} />
          <span className="text-sm font-medium">Active Package</span>
        </label>
      </div>

      <div className="border p-4 rounded-md">
        <h3 className="font-bold mb-4">Included Services</h3>
        {services.map(s => {
          const isSelected = selectedServices.some(ps => ps.service_id === s.id)
          return (
            <label key={s.id} className="flex items-center space-x-2 mb-2">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedServices([...selectedServices, { service_id: s.id, sequence_order: selectedServices.length }])
                  } else {
                    setSelectedServices(selectedServices.filter(ps => ps.service_id !== s.id))
                  }
                }}
              />
              <span>{s.name_en} ({s.name_ar})</span>
            </label>
          )
        })}
      </div>

      <button disabled={loading} className="bg-accent text-accent-foreground px-4 py-2 rounded-md font-medium">
        {loading ? 'Saving...' : 'Save Package'}
      </button>
    </form>
  )
}
