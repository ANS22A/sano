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
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{t.recentBookings}</h2>
        <Link
          href="/admin/bookings"
          className="text-xs font-medium text-accent hover:text-accent transition-colors"
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
              <tr className="bg-surface">
                {[t.bookingNumber, t.customer, t.service, t.date, t.status, t.price].map((h) => (
                  <th key={h} className="text-start px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface transition-colors group">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {b.booking_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">{b.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-40 truncate">{b.service_name}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {b.date} {b.start_time.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={b.status} label={b.status} />
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">
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
