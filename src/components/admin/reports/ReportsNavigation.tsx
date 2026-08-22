/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface Props {
  t: any
}

export function ReportsNavigation({ t }: Props) {
  const pathname = usePathname()

  const tabs = [
    { name: t.ownerDashboard?.summary || 'P&L Summary', href: '/admin/reports' },
    { name: t.ownerDashboard?.revenueReport || 'Revenue', href: '/admin/reports/revenue' },
    { name: t.ownerDashboard?.expensesReport || 'Expenses', href: '/admin/reports/expenses' },
    { name: t.ownerDashboard?.payrollReport || 'Payroll', href: '/admin/reports/payroll' },
    { name: t.ownerDashboard?.receivablesReport || 'Receivables', href: '/admin/reports/receivables' },
  ]

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-muted-foreground',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}


