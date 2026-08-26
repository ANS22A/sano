'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPartner, updatePartner, type PartnerRecord } from '@/app/actions/adminPartners.actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { AdminTranslations, AdminDir } from '@/lib/admin/translations'

interface Props {
  partner?: PartnerRecord
  t: AdminTranslations
  dir: AdminDir
}

export function PartnerForm({ partner, t, dir }: Props) {
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
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/partners"
          className="p-2 rounded-full hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading text-foreground">
            {isEdit ? t.partners.editPartner : t.partners.newPartner}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? t.partners.updateDetails : t.partners.addBusinessPartner}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6" dir={dir}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                {t.partners.name} <span className="text-error">*</span>
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
                  {t.partners.phone}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  dir="ltr"
                  defaultValue={partner?.phone || ''}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-start"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  {t.partners.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  dir="ltr"
                  defaultValue={partner?.email || ''}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-start"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ownership_percentage" className="block text-sm font-medium text-foreground mb-1">
                {t.partners.ownership} (%)
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
                {t.partners.notes}
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
            <div className="px-4 py-3 bg-error-bg text-error text-sm rounded-md border border-error-border">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/partners"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.common.cancel}
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? t.common.saving : t.partners.savePartner}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
