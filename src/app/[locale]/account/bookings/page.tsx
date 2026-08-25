import { getTranslations } from 'next-intl/server'
import { getCustomerBookings } from '@/app/actions/customerAccount.actions'
import { Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountBookingsPage(props: PageProps) {
  const { locale } = await props.params
  const t = await getTranslations('account')
  const isAr = locale === 'ar'

  const { data: bookings } = await getCustomerBookings()

  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending') || []
  const historyBookings = bookings?.filter(b => b.status === 'completed' || b.status === 'cancelled') || []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function BookingCard({ booking }: { booking: any }) {
    const serviceName = isAr ? booking.services?.name_ar : booking.services?.name_en
    return (
      <Link href={`/${locale}/account/bookings/${booking.id}`} className="block">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-subtle hover:border-border-strong transition-colors shadow-sm group">
          <div className="w-16 h-16 rounded-full bg-surface text-secondary flex items-center justify-center shrink-0 group-hover:bg-surface-muted transition-colors">
            <Calendar className="w-8 h-8" />
          </div>
          
          <div className="flex-1 space-y-1 text-center md:text-start">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground">{serviceName}</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${booking.status === 'confirmed' ? 'bg-success-bg text-success' :
                  booking.status === 'pending' ? 'bg-warning-bg text-warning' :
                  booking.status === 'cancelled' ? 'bg-error-bg text-error' :
                  'bg-muted text-foreground'}`}>
                {booking.status}
              </span>
            </div>
            
            <p className="text-secondary font-medium text-sm">
              {new Date(booking.date).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {booking.start_time.slice(0, 5)}
            </p>
          </div>
          
          <div className="hidden md:flex items-center justify-center text-muted-foreground group-hover:text-secondary transition-colors">
            <ChevronRight className="w-6 h-6 rtl:rotate-180" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-foreground font-display">{t('bookings')}</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground font-display border-b border-subtle pb-4">{t('upcomingBooking')}</h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-surface rounded-2xl border border-subtle border-dashed">
            <p className="text-muted-foreground font-medium">{t('noUpcoming')}</p>
          </div>
        )}
      </div>

      {historyBookings.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground font-display border-b border-subtle pb-4">{t('history')}</h2>
          <div className="space-y-4 opacity-75 hover:opacity-100 transition-opacity">
            {historyBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
