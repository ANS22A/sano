import Link from 'next/link'
import { AdminBadge } from '../ui/AdminBadge'
import { AdminEmptyState } from '../ui/AdminEmptyState'
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react'
import type { RecentBooking } from '@/app/actions/adminDashboard.actions'
import { AdminDir } from '@/lib/admin/translations'

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
  dir?: AdminDir
}

export function RecentBookings({ bookings, t, dir = 'ltr' }: Props) {
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-base font-heading font-semibold text-foreground tracking-wide">{t.recentBookings}</h2>
        <Link
          href="/admin/bookings"
          className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
        >
          {dir === 'rtl' ? 'عرض الكل' : 'View all'}
          <ArrowIcon className="w-3.5 h-3.5" />
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
                    {b.price_sar.toLocaleString()} {dir === 'rtl' ? 'ر.س' : 'SAR'}
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
