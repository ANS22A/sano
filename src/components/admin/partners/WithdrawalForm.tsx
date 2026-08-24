'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { createPartnerWithdrawal, type PartnerRecord } from '@/app/actions/adminPartners.actions'
import { ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-react'

interface Props {
  partners: PartnerRecord[]
}

export function WithdrawalForm({ partners }: Props) {
  const { lang, t } = useAdmin()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const inputCls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  const labelCls = 'text-sm font-medium'

  const isAr = lang === 'ar'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (selectedFile) {
      formData.set('attachment', selectedFile)
    }

    startTransition(async () => {
      try {
        await createPartnerWithdrawal(formData)
        router.push('/admin/partners/withdrawals')
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <Link 
          href="/admin/partners/withdrawals" 
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
        >
          {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t.common.cancel}
        </Link>
        <h1 className="text-2xl font-bold mt-4">
          {t.partners?.newWithdrawal || 'New Withdrawal'}
        </h1>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="partner_id" className="text-sm font-medium">
                {t.partners?.partner || 'Partner'} <span className="text-destructive">*</span>
              </label>
              <select
                id="partner_id"
                name="partner_id"
                required
                className={inputCls}
              >
                <option value="">Select...</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                {t.reports?.columns?.amount || 'Amount'} (SAR) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0.01"
                required
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="withdrawal_date" className="text-sm font-medium">
                {t.reports?.columns?.date || 'Date'} <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                id="withdrawal_date"
                name="withdrawal_date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="payment_method" className="text-sm font-medium">
                Payment Method <span className="text-destructive">*</span>
              </label>
              <select
                id="payment_method"
                name="payment_method"
                required
                className={inputCls}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="mada">Mada</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="reference" className="text-sm font-medium">
                {t.reports?.columns?.reference || 'Reference'} <span className="text-destructive">*</span>
              </label>
              <input
                id="reference"
                name="reference"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className={inputCls}
            />
          </div>

          {/* ATTACHMENT UPLOAD (Optional) */}
          <div>
            <label className={labelCls}>Attachment</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-surface-muted/50 transition-colors">
              <input type="file" name="file" id="file_upload" className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file_upload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-primary">Upload File</span>
                {selectedFile && <span className="text-xs text-muted-foreground">{selectedFile.name}</span>}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/partners/withdrawals"
              className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-surface-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
