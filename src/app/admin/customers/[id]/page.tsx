import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomerWithBookings } from '@/app/actions/adminCustomers.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { CustomerFormWrapper } from '@/components/admin/ui/CustomerFormWrapper'
import { ArrowLeft } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang, ADMIN_DIR } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Customer' }

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { customer, bookings } = await getCustomerWithBookings(id)
  if (!customer) notFound()

  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const dir = ADMIN_DIR[lang]
  const t = adminT[lang]

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t.common.back}
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">{customer.full_name}</h1>
        <CustomerFormWrapper t={t} dir={dir} customer={{ id: customer.id, full_name: customer.full_name, phone: customer.phone, email: customer.email }} variant="button" />
      </div>

      {/* Customer info */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <dl className="divide-y divide-border-subtle">
          {[
            [lang === 'ar' ? 'الهاتف' : 'Phone', customer.phone],
            [lang === 'ar' ? 'البريد الإلكتروني' : 'Email', customer.email ?? '—'],
            [lang === 'ar' ? 'عميل منذ' : 'Customer since', new Date(customer.created_at).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label} className="flex px-6 py-3 gap-4">
              <dt className="text-xs font-medium text-muted-foreground w-32 shrink-0">{label}</dt>
              <dd className="text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Booking history */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{lang === 'ar' ? 'سجل الحجوزات' : 'Booking History'} ({bookings.length})</h2>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {bookings.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">{lang === 'ar' ? 'لا توجد حجوزات حتى الآن' : 'No bookings yet'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    {[
                      lang === 'ar' ? 'رقم الحجز' : 'Booking #', 
                      lang === 'ar' ? 'الخدمة' : 'Service', 
                      lang === 'ar' ? 'التاريخ' : 'Date', 
                      lang === 'ar' ? 'الحالة' : 'Status', 
                      lang === 'ar' ? 'السعر' : 'Price'
                    ].map((h) => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface">
                      <td className="px-4 py-3">
                        <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs text-accent hover:underline">
                          {b.booking_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(lang === 'ar' ? (b.services as { name_ar: string } | null)?.name_ar : (b.services as { name_en: string } | null)?.name_en) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
                      <td className="px-4 py-3"><AdminBadge status={b.status ?? ''} label={b.status ?? ''} /></td>
                      <td className="px-4 py-3 font-medium text-foreground">{Number(b.price_sar).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
