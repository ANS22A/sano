'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSalary } from '@/app/actions/adminPayroll.actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  staff: Array<{ id: string; name_en: string; name_ar: string }>
}

export function PayrollForm({ staff }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await createSalary(formData)
        router.push('/admin/payroll')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  // Generate recent months (YYYY-MM)
  const today = new Date()
  const recentMonths = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/payroll"
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-foreground">New Payroll Record</h1>
          <p className="text-sm text-muted-foreground">Record employee salary.</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff_id" className="block text-sm font-medium text-foreground mb-1">
                  Employee <span className="text-error">*</span>
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
                <label htmlFor="month" className="block text-sm font-medium text-foreground mb-1">
                  Month (YYYY-MM) <span className="text-error">*</span>
                </label>
                <input
                  id="month"
                  name="month"
                  type="month"
                  required
                  defaultValue={recentMonths[0]}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-foreground mb-1">
                  Reference # <span className="text-error">*</span>
                </label>
                <input
                  id="reference"
                  name="reference"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. PAY-2026-08-001"
                />
              </div>
              
              <div>
                <label htmlFor="payment_status" className="block text-sm font-medium text-foreground mb-1">
                  Payment Status
                </label>
                <select
                  id="payment_status"
                  name="payment_status"
                  defaultValue="pending"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label htmlFor="gross_salary" className="block text-sm font-medium text-foreground mb-1">
                  Gross Salary
                </label>
                <input id="gross_salary" name="gross_salary" type="number" step="0.01" min="0" required defaultValue="0" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="advances_deducted" className="block text-sm font-medium text-foreground mb-1">
                  Advances Ded.
                </label>
                <input id="advances_deducted" name="advances_deducted" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="other_deductions" className="block text-sm font-medium text-foreground mb-1">
                  Other Ded.
                </label>
                <input id="other_deductions" name="other_deductions" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="bonuses" className="block text-sm font-medium text-foreground mb-1">
                  Bonuses
                </label>
                <input id="bonuses" name="bonuses" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
              </div>
            </div>

            <div>
              <label htmlFor="net_salary" className="block text-sm font-medium text-foreground mb-1">
                Net Salary <span className="text-error">*</span>
              </label>
              <input
                id="net_salary"
                name="net_salary"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-lg text-primary"
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="px-4 py-3 bg-error-bg text-error text-sm rounded-md border border-error-border">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Link
              href="/admin/payroll"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
