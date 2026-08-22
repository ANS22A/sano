/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Search } from 'lucide-react'

interface Column<T> {
  key: string
  title: string
  render?: (val: any, row: T) => React.ReactNode
  getValue?: (row: T) => string | number
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
        const val = c.getValue ? c.getValue(row) : (row as any)[c.key]
        let str = String(val ?? '')
        // Escape quotes and wrap in quotes if contains comma
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
      const val = c.getValue ? c.getValue(row) : (row as any)[c.key]
      return String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-[#e8ddd0]">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <label className="text-sm font-medium text-[#2a2118]">{t.ownerDashboard?.dateRange || 'Date Range'}</label>
          <select 
            value={currentRange}
            onChange={handleRangeChange}
            className="bg-transparent border border-[#e8ddd0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#c9a96e]"
          >
            <option value="today">{t.ownerDashboard?.today || 'Today'}</option>
            <option value="this_week">{t.ownerDashboard?.thisWeek || 'This Week'}</option>
            <option value="this_month">{t.ownerDashboard?.thisMonth || 'This Month'}</option>
            <option value="this_year">{t.ownerDashboard?.thisYear || 'This Year'}</option>
            <option value="all_time">All Time</option>
          </select>
          {currentRange === 'custom' && (
            <div className="text-sm text-[#9a8a7a]">
              {from} - {to}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7a]" />
            <input
              type="text"
              placeholder={t.common?.search || 'Search...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-[#e8ddd0] rounded-lg focus:outline-none focus:border-[#c9a96e]"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#2a2118] bg-[#f5ede0] rounded-lg hover:bg-[#e8ddd0] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead>
              <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                {columns.map(c => (
                  <th key={c.key} className="px-6 py-3 font-medium text-[#9a8a7a] text-start whitespace-nowrap">
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8de]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-[#9a8a7a]">
                    {t.reports?.noData || 'No data found for this period.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-[#faf7f4] transition-colors">
                    {columns.map(c => {
                      const val = (row as any)[c.key]
                      return (
                        <td key={c.key} className="px-6 py-4 text-[#2a2118] whitespace-nowrap">
                          {c.render ? c.render(val, row) : (val ?? '-')}
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


