'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPartner, updatePartner, type PartnerRecord } from '@/app/actions/adminPartners.actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  partner?: PartnerRecord
}

export function PartnerForm({ partner }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isEdit = !!partner

  async function handleSubmit(formData: FormData) {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updatePartner(partner.id, formData)
        } else {
          await createPartner(formData)
        }
        router.push('/admin/partners')
      } catch (err: any) {
        setErrorMsg(err.message || 'Something went wrong')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/partners"
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-foreground">
            {isEdit ? 'Edit Partner' : 'New Partner'}
          </h1>
          <p className="text-sm text-neutral-500">
            {isEdit ? 'Update partner details.' : 'Add a new business partner.'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={partner?.name}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  defaultValue={partner?.phone || ''}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={partner?.email || ''}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ownership_percentage" className="block text-sm font-medium text-foreground mb-1">
                Ownership Percentage (%)
              </label>
              <input
                id="ownership_percentage"
                name="ownership_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={partner?.ownership_percentage || ''}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={partner?.notes || ''}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="px-4 py-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Link
              href="/admin/partners"
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
