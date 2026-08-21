import Link from 'next/link'
import { AdminBadge } from '../ui/AdminBadge'
import { AdminEmptyState } from '../ui/AdminEmptyState'
import { BookOpen } from 'lucide-react'
import type { RecentBooking } from '@/app/actions/adminDashboard.actions'

interface Props {
  bookings: RecentBooking[]
  t: {
    recentBookings: string
    noBookings: string
    bookingNumber: string
    customer: string
    service: string
    date: string
    status: string
    price: string
  }
}

export function RecentBookings({ bookings, t }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8de]">
        <h2 className="text-sm font-semibold text-[#2a2118]">{t.recentBookings}</h2>
        <Link
          href="/admin/bookings"
          className="text-xs font-medium text-[#c9a96e] hover:text-[#b8983d] transition-colors"
        >
          View all →
        </Link>
      </div>

      {bookings.length === 0 ? (
        <AdminEmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title={t.noBookings}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#faf7f4]">
                {[t.bookingNumber, t.customer, t.service, t.date, t.status, t.price].map((h) => (
                  <th key={h} className="text-start px-4 py-2.5 text-xs font-medium text-[#9a8a7a] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8de]">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#faf7f4] transition-colors group">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="font-mono text-xs text-[#c9a96e] hover:underline"
                    >
                      {b.booking_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#2a2118] font-medium">{b.customer_name}</td>
                  <td className="px-4 py-3 text-[#7a6a57] max-w-40 truncate">{b.service_name}</td>
                  <td className="px-4 py-3 text-[#7a6a57] whitespace-nowrap">
                    {b.date} {b.start_time.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={b.status} label={b.status} />
                  </td>
                  <td className="px-4 py-3 text-[#2a2118] font-medium whitespace-nowrap">
                    {b.price_sar.toLocaleString()} SAR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
