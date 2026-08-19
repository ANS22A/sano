import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomerWithBookings } from '@/app/actions/adminLocations.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Customer' }

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { customer, bookings } = await getCustomerWithBookings(id)
  if (!customer) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-[#9a8a7a] hover:text-[#2a2118]">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-xl font-bold text-[#2a2118]">{customer.full_name}</h1>

      {/* Customer info */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <dl className="divide-y divide-[#f0e8de]">
          {[
            ['Phone', customer.phone],
            ['Email', customer.email ?? '—'],
            ['Customer since', new Date(customer.created_at).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label} className="flex px-6 py-3 gap-4">
              <dt className="text-xs font-medium text-[#9a8a7a] w-32 shrink-0">{label}</dt>
              <dd className="text-sm text-[#2a2118]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Booking history */}
      <div>
        <h2 className="text-sm font-semibold text-[#2a2118] mb-3">Booking History ({bookings.length})</h2>
        <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
          {bookings.length === 0 ? (
            <p className="text-center text-sm text-[#9a8a7a] py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                    {['Booking #', 'Service', 'Date', 'Status', 'Price'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#9a8a7a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e8de]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#faf7f4]">
                      <td className="px-4 py-3">
                        <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs text-[#c9a96e] hover:underline">
                          {b.booking_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#7a6a57]">
                        {(b.services as { name_en: string } | null)?.name_en ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#7a6a57]">{b.date}</td>
                      <td className="px-4 py-3"><AdminBadge status={b.status ?? ''} label={b.status ?? ''} /></td>
                      <td className="px-4 py-3 font-medium text-[#2a2118]">{Number(b.price_sar).toLocaleString()} SAR</td>
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
