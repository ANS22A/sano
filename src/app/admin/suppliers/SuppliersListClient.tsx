'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/components/admin/shell/AdminShell'
import { toggleSupplierStatus } from '@/app/actions/adminSuppliers.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import {
  Building2,
  Plus,
  Edit2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Supplier = Tables<'suppliers'>

interface Props {
  suppliers: Supplier[]
  total: number
  currentPage?: number
  currentQ?: string
  currentActiveOnly?: boolean
}

export function SuppliersListClient({
  suppliers: initialSuppliers,
  total,
  currentActiveOnly = false,
}: Props) {
  const { lang } = useAdmin()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [isPending, startTransition] = useTransition()

  const isAr = lang === 'ar'

  function handleToggleActive(supplier: Supplier) {
    const nextState = !supplier.is_active
    startTransition(async () => {
      const res = await toggleSupplierStatus(supplier.id, nextState)
      if (res.success) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === supplier.id ? { ...s, is_active: nextState } : s))
        )
        router.refresh()
      } else {
        alert(res.error || 'Failed to update supplier status')
      }
    })
  }

  function handleFilterChange(key: string, value: string) {
    const searchParams = new URLSearchParams(window.location.search)
    if (value && value !== 'all') {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    searchParams.set('page', '1')
    router.push(`/admin/suppliers?${searchParams.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2a2118]">
            {isAr ? 'إدارة الموردين' : 'Suppliers Management'}
          </h1>
          <p className="text-xs text-[#7a6a57] mt-0.5">
            {isAr
              ? 'دليل جهات التوريد والشركات ومزودي الخدمات'
              : 'Directory of vendor partners, companies, and product suppliers'}
          </p>
        </div>
        <div>
          <Link
            href="/admin/suppliers/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2118] text-white text-sm font-medium hover:bg-[#3a3128] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مورد' : 'Add Supplier'}</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] p-4 flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="flex-1">
          <AdminSearchBar
            placeholder={isAr ? 'البحث باسم المورد، الهاتف، البريد…' : 'Search supplier name, phone, email…'}
            paramName="q"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'active'].map((opt) => {
            const isSelected = opt === 'active' ? currentActiveOnly : !currentActiveOnly
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleFilterChange('active', opt === 'active' ? 'true' : '')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#2a2118] text-white border-[#2a2118]'
                    : 'bg-[#faf7f4] text-[#7a6a57] border-[#e8ddd0] hover:bg-[#f5ede0]'
                }`}
              >
                {opt === 'all'
                  ? isAr
                    ? 'الكل'
                    : 'All'
                  : isAr
                  ? 'الموردون النشطون فقط'
                  : 'Active Only'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden shadow-sm">
        {suppliers.length === 0 ? (
          <AdminEmptyState
            icon={<Building2 className="w-6 h-6 text-[#9a8a7a]" />}
            title={isAr ? 'لا يوجد موردون' : 'No suppliers found'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'اسم المورد' : 'Supplier Name'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'معلومات الاتصال' : 'Contact Info'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'العنوان' : 'Address'}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-end px-4 py-3 text-xs font-semibold text-[#9a8a7a]">
                    {isAr ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#faf7f4] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#2a2118]">{s.name}</p>
                      {s.notes && (
                        <p className="text-xs text-[#9a8a7a] max-w-xs truncate">{s.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs space-y-1">
                      {s.phone && (
                        <div className="flex items-center gap-1.5 text-[#7a6a57]">
                          <Phone className="w-3 h-3 text-[#c9a96e]" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center gap-1.5 text-[#7a6a57]">
                          <Mail className="w-3 h-3 text-[#c9a96e]" />
                          <span>{s.email}</span>
                        </div>
                      )}
                      {!s.phone && !s.email && <span className="text-[#9a8a7a]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#7a6a57]">
                      {s.address ? (
                        <div className="flex items-center gap-1.5 max-w-xs truncate">
                          <MapPin className="w-3 h-3 text-[#c9a96e] shrink-0" />
                          <span>{s.address}</span>
                        </div>
                      ) : (
                        <span className="text-[#9a8a7a]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={s.is_active ? 'active' : 'inactive'}
                        label={
                          s.is_active
                            ? isAr
                              ? 'نشط'
                              : 'Active'
                            : isAr
                            ? 'غير نشط'
                            : 'Inactive'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/suppliers/${s.id}/edit`}
                          className="p-1.5 rounded-lg text-[#7a6a57] hover:text-[#2a2118] hover:bg-[#f5ede0] transition-colors"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(s)}
                          disabled={isPending}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.is_active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={
                            s.is_active
                              ? isAr
                                ? 'تعطيل المورد'
                                : 'Deactivate'
                              : isAr
                              ? 'تفعيل المورد'
                              : 'Activate'
                          }
                        >
                          {s.is_active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination total={total} perPage={25} />
      </div>
    </div>
  )
}
