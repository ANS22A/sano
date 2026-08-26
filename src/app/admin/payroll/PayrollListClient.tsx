'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SalaryRecord } from '@/app/actions/adminPayroll.actions'
import { toggleArchiveSalary } from '@/app/actions/adminPayroll.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog'
import { Archive, ArchiveRestore } from 'lucide-react'

import type { AdminTranslations } from '@/lib/admin/translations'

interface Props {
  salaries: SalaryRecord[]
  t: AdminTranslations
  lang: 'en' | 'ar'
}

export function PayrollListClient({ salaries, t, lang }: Props) {
  const router = useRouter()
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; archive: boolean } | null>(null)
  
  const handleToggleArchive = async () => {
    if (!archiveTarget) return
    await toggleArchiveSalary(archiveTarget.id, archiveTarget.archive)
    setArchiveTarget(null)
    router.refresh()
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-start text-muted-foreground">
          <thead className="bg-surface-muted text-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4 text-start font-heading">{t.payroll.reference}</th>
              <th className="px-6 py-4 text-start font-heading">{t.payroll.staff}</th>
              <th className="px-6 py-4 text-start font-heading">{t.payroll.month}</th>
              <th className="px-6 py-4 text-end font-heading">{t.payroll.netSalary}</th>
              <th className="px-6 py-4 text-start font-heading">{t.payroll.status}</th>
              <th className="px-6 py-4 text-end font-heading">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {salaries.map(salary => (
              <tr key={salary.id} className="hover:bg-surface-muted/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-foreground font-medium">{salary.reference}</td>
                <td className="px-6 py-4">{lang === 'ar' ? salary.staff?.name_ar : salary.staff?.name_en}</td>
                <td className="px-6 py-4">{salary.month}</td>
                <td className="px-6 py-4 text-end font-medium text-foreground">{salary.net_salary.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR' })}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <AdminBadge status={salary.payment_status} label={t.status[salary.payment_status as keyof typeof t.status] || salary.payment_status} />
                    {salary.is_archived && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                        {t.payroll.archived}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-end">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {salary.is_archived ? (
                      <button
                        onClick={() => setArchiveTarget({ id: salary.id, archive: false })}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
                        title={t.payroll.unarchive}
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setArchiveTarget({ id: salary.id, archive: true })}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
                        title={t.payroll.archive}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!archiveTarget}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleToggleArchive}
        title={archiveTarget?.archive ? t.payroll.confirmArchive : t.payroll.confirmUnarchive}
        description={archiveTarget?.archive ? t.payroll.confirmArchiveDesc : t.payroll.confirmUnarchiveDesc}
        confirmLabel={archiveTarget?.archive ? t.payroll.archive : t.payroll.unarchive}
        cancelLabel={t.common.cancel}
        destructive={archiveTarget?.archive}
      />
    </>
  )
}
