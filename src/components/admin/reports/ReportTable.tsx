/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Search } from 'lucide-react'

export type ColumnType = 
  | 'text'
  | 'date'
  | 'currency'
  | 'status'
  | 'method'
  | 'percentage'
  | 'number'
  | 'capitalize'
  | 'capitalize-replace'
  | 'amount-colored'
  | 'amount-bold'
  | 'nested'

export interface Column<T> {
  key: string
  title: string
  type?: ColumnType
  nestedPath?: string[] // e.g. ['suppliers', 'name']
  fallbackPath?: string[] // e.g. ['staff', 'name_ar'] for fallback
  constantValue?: string
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  filename: string
  currentRange: string
  from: string
  to: string
  t: Record<string, any>
}

function getNestedValue(obj: any, path: string[]) {
  return path.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

function resolveCellValue(c: Column<any>, row: any): any {
  if (c.constantValue !== undefined) return c.constantValue
  
  if (c.nestedPath) {
    let val = getNestedValue(row, c.nestedPath)
    if (!val && c.fallbackPath) {
      val = getNestedValue(row, c.fallbackPath)
    }
    return val
  }
  
  return row[c.key]
}

function formatValue(c: Column<any>, val: any, row: any): string | number {
  if (c.type === 'date') return val ? new Date(val).toLocaleDateString() : ''
  if (c.type === 'currency' || c.type === 'amount-colored' || c.type === 'amount-bold') {
    if (c.type === 'amount-colored' && row.type === 'refund') {
      return -Number(val)
    }
    return Number(val)
  }
  if (c.type === 'capitalize' || c.type === 'capitalize-replace' || c.type === 'method') {
    let str = String(val ?? '')
    if (c.type === 'capitalize-replace' || c.type === 'method') str = str.replace(/_/g, ' ')
    return str
  }
  return val ?? ''
}

export function ReportTable<T>({ data, columns, filename, currentRange, from, to, t }: Props<T>) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'custom') return
    const url = new URL(window.location.href)
    url.searchParams.set('range', val)
    router.push(url.pathname + url.search)
  }

  const exportCSV = () => {
    const headers = columns.map(c => c.title).join(',')
    const rows = data.map(row => {
      return columns.map(c => {
        const rawVal = resolveCellValue(c, row)
        const val = formatValue(c, rawVal, row)
        let str = String(val ?? '')
        str = str.replace(/"/g, '""')
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          str = `"${str}"`
        }
        return str
      }).join(',')
    }).join('\n')

    const csvContent = '\uFEFF' + headers + '\n' + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${from}_to_${to}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredData = data.filter(row => {
    if (!searchTerm) return true
    return columns.some(c => {
      const rawVal = resolveCellValue(c, row)
      const val = formatValue(c, rawVal, row)
      return String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  const renderCell = (c: Column<any>, val: any, row: any) => {
    if (val == null || val === '') return '-'
    
    switch (c.type) {
      case 'date':
        return new Date(val).toLocaleDateString()
      case 'capitalize':
        return <span className="capitalize">{String(val)}</span>
      case 'capitalize-replace':
      case 'method':
        return <span className="capitalize">{String(val).replace(/_/g, ' ')}</span>
      case 'amount-colored':
        const isRefund = row.type === 'refund'
        return <span className={isRefund ? 'text-red-600' : 'text-green-600'}>{isRefund ? '-' : ''}{val}</span>
      case 'amount-bold':
        return <span className="font-bold text-orange-600">{val}</span>
      case 'status':
        return <span className="capitalize">{String(val).replace(/_/g, ' ')}</span>
      default:
        return val
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <label className="text-sm font-medium text-foreground">{t.ownerDashboard.dateRange}</label>
          <select 
            value={currentRange}
            onChange={handleRangeChange}
            className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
          >
            <option value="today">{t.ownerDashboard.today}</option>
            <option value="this_week">{t.ownerDashboard.thisWeek}</option>
            <option value="this_month">{t.ownerDashboard.thisMonth}</option>
            <option value="this_year">{t.ownerDashboard.thisYear}</option>
            <option value="all_time">All Time</option>
          </select>
          {currentRange === 'custom' && (
            <div className="text-sm text-muted-foreground">
              {from} - {to}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.common.search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full ps-9 pe-4 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-surface-muted rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead>
              <tr className="bg-surface border-b border-border">
                {columns.map(c => (
                  <th key={c.key} className="px-6 py-3 font-medium text-muted-foreground text-start whitespace-nowrap">
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    {t.reports.noData}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-surface transition-colors">
                    {columns.map(c => {
                      const rawVal = resolveCellValue(c, row)
                      return (
                        <td key={c.key} className="px-6 py-4 text-foreground whitespace-nowrap">
                          {renderCell(c, rawVal, row)}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


