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
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-[#E7DBEC] hover:border-[#A98FB8] transition-colors shadow-sm group">
          <div className="w-16 h-16 rounded-full bg-[#faf7f4] text-[#6F4E7C] flex items-center justify-center shrink-0 group-hover:bg-[#E7DBEC] transition-colors">
            <Calendar className="w-8 h-8" />
          </div>
          
          <div className="flex-1 space-y-1 text-center md:text-start">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-[#2E1F38]">{serviceName}</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'}`}>
                {booking.status}
              </span>
            </div>
            
            <p className="text-[#6F4E7C] font-medium text-sm">
              {new Date(booking.date).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {booking.start_time.slice(0, 5)}
            </p>
          </div>
          
          <div className="hidden md:flex items-center justify-center text-[#A98FB8] group-hover:text-[#6F4E7C] transition-colors">
            <ChevronRight className="w-6 h-6 rtl:rotate-180" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-[#2E1F38] font-serif">{t('bookings')}</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#2E1F38] font-serif border-b border-[#E7DBEC] pb-4">{t('upcomingBooking')}</h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-[#faf7f4] rounded-2xl border border-[#E7DBEC] border-dashed">
            <p className="text-[#A98FB8] font-medium">{t('noUpcoming')}</p>
          </div>
        )}
      </div>

      {historyBookings.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#2E1F38] font-serif border-b border-[#E7DBEC] pb-4">{t('history')}</h2>
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
