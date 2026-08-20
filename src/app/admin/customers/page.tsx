import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminCustomers } from '@/app/actions/adminCustomers.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { CustomerFormWrapper } from '@/components/admin/ui/CustomerFormWrapper'
import { Users } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang, ADMIN_DIR } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Customers' }

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const dir = ADMIN_DIR[lang]
  const t = adminT[lang]

  const { customers, total } = await getAdminCustomers({ page: Number(sp.page ?? 1), q: sp.q })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#2a2118]">{t.customers.title}</h1>
          <p className="text-sm text-[#9a8a7a]">{total} total</p>
        </div>
        <CustomerFormWrapper t={t} dir={dir} />
      </div>

      <AdminSearchBar placeholder={t.customers.search} paramName="q" />

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        {customers.length === 0 ? (
          <AdminEmptyState icon={<Users className="w-6 h-6" />} title={t.customers.noResults} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  {[t.customers.name, t.customers.phone, t.customers.email, t.common.actions].map((h) => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium text-[#9a8a7a] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#faf7f4] transition-colors group">
                    <td className="px-4 py-3 font-medium text-[#2a2118]">{c.full_name}</td>
                    <td className="px-4 py-3 text-[#7a6a57] font-mono text-xs">{c.phone}</td>
                    <td className="px-4 py-3 text-[#7a6a57]">{c.email ?? '—'}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Link href={`/admin/customers/${c.id}`} className="text-xs font-medium text-[#c9a96e] hover:underline">
                        {t.common.view}
                      </Link>
                      <CustomerFormWrapper t={t} dir={dir} customer={{ id: c.id, full_name: c.full_name, phone: c.phone, email: c.email }} variant="icon" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AdminPagination total={total} perPage={25} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
    </div>
  )
}
