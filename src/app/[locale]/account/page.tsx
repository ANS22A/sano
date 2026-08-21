import { getTranslations } from 'next-intl/server'
import { getCustomerProfile, getCustomerBookings } from '@/app/actions/customerAccount.actions'
import { Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountDashboardPage(props: PageProps) {
  const { locale } = await props.params
  const t = await getTranslations('account')
  const isAr = locale === 'ar'

  const { data: profile } = await getCustomerProfile()
  const { data: bookings } = await getCustomerBookings()

  // Find the first upcoming booking
  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending') || []
  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E7DBEC]">
        <h1 className="text-3xl font-bold text-[#2E1F38] mb-2 font-serif">
          {t('welcome')}, {profile?.full_name?.split(' ')[0] || ''}
        </h1>
        <p className="text-[#6F4E7C] font-medium">
          {profile?.email}
        </p>
      </div>

      {/* Next Booking */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E7DBEC]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2E1F38] font-serif">{t('upcomingBooking')}</h2>
          <Link href={`/${locale}/account/bookings`} className="text-sm font-medium text-[#6F4E7C] hover:underline flex items-center gap-1">
            {t('bookings')}
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {nextBooking ? (
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-[#faf7f4] rounded-2xl border border-[#E7DBEC]">
            <div className="w-16 h-16 rounded-full bg-[#E7DBEC] text-[#6F4E7C] flex items-center justify-center shrink-0">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-1 text-center md:text-start">
              <h3 className="text-lg font-bold text-[#2E1F38]">
                {isAr ? nextBooking.services?.name_ar : nextBooking.services?.name_en}
              </h3>
              <p className="text-[#6F4E7C] font-medium text-sm">
                {new Date(nextBooking.date).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {nextBooking.start_time.slice(0, 5)}
              </p>
            </div>
            <Link
              href={`/${locale}/account/bookings/${nextBooking.id}`}
              className="px-6 py-2.5 rounded-xl bg-[#2E1F38] text-[#D4AF37] font-bold text-sm tracking-wide hover:bg-[#1f1526] transition-colors"
            >
              {t('viewDetails')}
            </Link>
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-[#faf7f4] rounded-2xl border border-[#E7DBEC] border-dashed">
            <p className="text-[#A98FB8] font-medium">{t('noUpcoming')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
