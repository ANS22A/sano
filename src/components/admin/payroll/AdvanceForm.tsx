'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAdvance } from '@/app/actions/adminPayroll.actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  staff: Array<{ id: string; name_en: string; name_ar: string }>
}

export function AdvanceForm({ staff }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await createAdvance(formData)
        router.push('/admin/payroll/advances')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/payroll/advances"
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-foreground">Record Employee Advance</h1>
          <p className="text-sm text-neutral-500">Record a salary advance for an employee.</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff_id" className="block text-sm font-medium text-foreground mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  id="staff_id"
                  name="staff_id"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">Select Employee...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name_en} ({s.name_ar})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={todayStr}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-foreground mb-1">
                  Reference # <span className="text-red-500">*</span>
                </label>
                <input
                  id="reference"
                  name="reference"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. ADV-2026-08-001"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">
                  Amount (SAR) <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-foreground mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="mada">Mada</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Optional notes about this advance..."
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : 'Record Advance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
