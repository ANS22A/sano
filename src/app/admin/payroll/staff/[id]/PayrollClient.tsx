/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { markSalaryPaid, generateMonthlySalary } from '@/app/actions/adminPayroll.actions'
import { AddAdvanceModal } from '@/components/admin/payroll/AddAdvanceModal'
import { Printer, Plus, CheckCircle, Loader2 } from 'lucide-react'

interface PayrollClientProps {
  staffId: string
  month: string
  salary: any
}

export function PayrollClient({ staffId, month, salary }: PayrollClientProps) {
  const { lang, t } = useAdmin()
  const isAr = lang === 'ar'
  const router = useRouter()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const handlePrint = () => {
    window.print()
  }
  
  const handleGenerate = () => {
    startTransition(async () => {
      try {
        await generateMonthlySalary(staffId, month)
        router.refresh()
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  const handleMarkPaid = () => {
    if (!salary) return
    startTransition(async () => {
      try {
        await markSalaryPaid(salary.id)
        router.refresh()
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 no-print">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-input bg-background hover:bg-surface-muted transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة سلفة' : 'Add Advance'}
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-input bg-background hover:bg-surface-muted transition-colors text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          {isAr ? 'طباعة / PDF' : 'Print / PDF'}
        </button>

        {!salary ? (
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAr ? 'إنشاء مسير الراتب' : 'Generate Salary'}
          </button>
        ) : salary.payment_status === 'pending' ? (
          <button
            onClick={handleMarkPaid}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success text-white hover:bg-success transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <CheckCircle className="w-4 h-4" />
            {isAr ? 'تحديد كمدفوع' : 'Mark as Paid'}
          </button>
        ) : null}
      </div>

      <AddAdvanceModal 
        staffId={staffId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
