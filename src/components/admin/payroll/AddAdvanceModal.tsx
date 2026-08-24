/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { createAdvance } from '@/app/actions/adminPayroll.actions'
import { Loader2 } from 'lucide-react'

export function AddAdvanceModal({
  staffId,
  isOpen,
  onClose,
}: {
  staffId: string
  isOpen: boolean
  onClose: () => void
}) {
  const { lang, t } = useAdmin()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      formData.set('staff_id', staffId)
      await createAdvance(formData)
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsPending(false)
    }
  }

  const isAr = lang === 'ar'
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl shadow-xl border max-w-md w-full overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold">{isAr ? 'إضافة سلفة' : 'Add Advance'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.reports?.columns?.amount || 'Amount'}</label>
            <input 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.reports?.columns?.date || 'Date'}</label>
            <input 
              name="date" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]} 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{isAr ? 'طريقة الدفع' : 'Payment Method'}</label>
            <select 
              name="payment_method" 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="bank_transfer">{isAr ? 'تحويل بنكي' : 'Bank Transfer'}</option>
              <option value="cash">{isAr ? 'نقدي' : 'Cash'}</option>
              <option value="mada">Mada</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.reports?.columns?.reference || 'Reference'}</label>
            <input 
              name="reference" 
              type="text" 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea 
              name="notes" 
              rows={2} 
              className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-xl text-sm font-medium hover:bg-surface-muted transition-colors"
            >
              {t.common.cancel || 'Cancel'}
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.common.save || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
