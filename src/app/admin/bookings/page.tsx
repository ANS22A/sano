import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminBookings } from '@/app/actions/adminBookings.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { AdminFilterSelect } from '@/components/admin/ui/AdminFilterSelect'
import { BookOpen, Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { getAdminLocations } from '@/app/actions/adminLocations.actions'
import { getAdminServices } from '@/app/actions/adminServices.actions'

export const metadata: Metadata = { title: 'Bookings' }

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show']

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const page = Number(sp.page ?? 1)
  const { bookings, total } = await getAdminBookings({
    page,
    q: sp.q,
    status: sp.status,
    date: sp.date,
    serviceId: sp.serviceId,
    locationId: sp.locationId,
    source: sp.source,
  })

  const locations = await getAdminLocations()
  const { services } = await getAdminServices({ active: 'true' })

  // We need to preserve query string when changing filters, 
  // but for simplicity in RSC we can build URLs
  const buildQuery = (updates: Record<string, string | undefined>) => {
    const q = new URLSearchParams()
    if (sp.q) q.set('q', sp.q)
    if (sp.status) q.set('status', sp.status)
    if (sp.date) q.set('date', sp.date)
    if (sp.serviceId) q.set('serviceId', sp.serviceId)
    if (sp.locationId) q.set('locationId', sp.locationId)
    if (sp.source) q.set('source', sp.source)
    
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === 'all') q.delete(k)
      else q.set(k, v)
    })
    return `/admin/bookings?${q.toString()}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#2a2118]">{t.bookings.title}</h1>
          <p className="text-sm text-[#9a8a7a]">{total} total</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#6F4E7C] text-white hover:bg-[#5a3d66] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {lang === 'ar' ? 'حجز جديد' : 'New Booking'}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <AdminSearchBar placeholder={t.bookings.search} paramName="q" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Services Filter */}
          <AdminFilterSelect
            paramName="serviceId"
            defaultValue="all"
            options={[
              { value: 'all', label: 'All Services' },
              ...services.map(s => ({ value: s.id, label: lang === 'ar' ? s.name_ar : s.name_en }))
            ]}
          />
          {/* Locations Filter */}
          <AdminFilterSelect
            paramName="locationId"
            defaultValue="all"
            options={[
              { value: 'all', label: 'All Locations' },
              ...locations.map(l => ({ value: l.id, label: lang === 'ar' ? l.name_ar : l.name_en }))
            ]}
          />
          {/* Source Filter */}
          <AdminFilterSelect
            paramName="source"
            defaultValue="all"
            options={[
              { value: 'all', label: lang === 'ar' ? 'جميع المصادر' : 'All Sources' },
              { value: 'website', label: lang === 'ar' ? 'الموقع' : 'Website' },
              { value: 'whatsapp', label: lang === 'ar' ? 'واتساب' : 'WhatsApp' },
              { value: 'phone', label: lang === 'ar' ? 'هاتف' : 'Phone' },
              { value: 'admin', label: lang === 'ar' ? 'إدارة' : 'Admin' },
              { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
            ]}
          />
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <Link
                key={s}
                href={buildQuery({ status: s })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  (sp.status ?? 'all') === s
                    ? 'bg-[#2a2118] text-white border-[#2a2118]'
                    : 'bg-white text-[#7a6a57] border-[#e8ddd0] hover:bg-[#f5ede0]'
                }`}
              >
                {t.status[s as keyof typeof t.status] ?? s}
              </Link>
            ))}
            {(sp.q || sp.status || sp.date || sp.serviceId || sp.locationId || sp.source) && (
              <Link
                href="/admin/bookings"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        {bookings.length === 0 ? (
          <AdminEmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title={t.bookings.noResults}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  {[t.bookings.bookingNumber, t.bookings.customer, t.bookings.service, t.bookings.date, t.bookings.status, lang === 'ar' ? 'المصدر' : 'Source', t.bookings.price, t.bookings.actions].map((h) => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium text-[#9a8a7a] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#faf7f4] transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#c9a96e]">{b.booking_number}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2a2118]">{b.customer_name}</td>
                    <td className="px-4 py-3 text-[#7a6a57] max-w-40 truncate">{b.service_name}</td>
                    <td className="px-4 py-3 text-[#7a6a57] whitespace-nowrap">{b.date} {b.start_time.slice(0,5)}</td>
                    <td className="px-4 py-3">
                      <AdminBadge status={b.status} label={t.status[b.status as keyof typeof t.status] ?? b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        b.source === 'whatsapp' ? 'bg-green-50 text-green-700' :
                        b.source === 'phone' ? 'bg-blue-50 text-blue-700' :
                        b.source === 'admin' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {b.source === 'website' ? (lang === 'ar' ? 'الموقع' : 'Website') :
                         b.source === 'whatsapp' ? (lang === 'ar' ? 'واتساب' : 'WhatsApp') :
                         b.source === 'phone' ? (lang === 'ar' ? 'هاتف' : 'Phone') :
                         b.source === 'admin' ? (lang === 'ar' ? 'إدارة' : 'Admin') :
                         b.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#2a2118] font-medium whitespace-nowrap">{b.price_sar.toLocaleString()} {t.common.sar}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-xs font-medium text-[#c9a96e] hover:underline"
                      >
                        {t.common.view}
                      </Link>
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
