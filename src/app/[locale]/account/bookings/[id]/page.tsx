import { getTranslations } from 'next-intl/server'
import { getCustomerBookingById } from '@/app/actions/customerAccount.actions'
import { Calendar, Clock, MapPin, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string, id: string }>
}

export default async function AccountBookingDetailPage(props: PageProps) {
  const { locale, id } = await props.params
  const t = await getTranslations('account')
  const isAr = locale === 'ar'

  const { data: booking, error } = await getCustomerBookingById(id)

  if (error || !booking) {
    notFound()
  }

  const serviceName = isAr ? booking.services?.name_ar : booking.services?.name_en
  const locationName = isAr ? booking.locations?.name_ar : booking.locations?.name_en
  const address = isAr ? booking.locations?.address_ar : booking.locations?.address_en

  return (
    <div className="space-y-8 max-w-2xl">
      <Link href={`/${locale}/account/bookings`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('bookings')}
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-subtle">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pb-8 border-b border-subtle">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display mb-2">{serviceName}</h1>
            <p className="text-secondary font-medium text-sm tracking-wide uppercase">Booking #{booking.id.slice(0, 8)}</p>
          </div>
          <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider
            ${booking.status === 'confirmed' ? 'bg-success-bg text-success' :
              booking.status === 'pending' ? 'bg-warning-bg text-warning' :
              booking.status === 'cancelled' ? 'bg-error-bg text-error' :
              'bg-muted text-foreground'}`}>
            {booking.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-6">
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('date')}</p>
              <p className="font-medium text-foreground">
                {new Date(booking.date).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('time')}</p>
              <p className="font-medium text-foreground">
                {booking.start_time.slice(0, 5)} {booking.services?.duration_minutes ? `(${booking.services.duration_minutes} minutes)` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('price')}</p>
              <p className="font-medium text-foreground">
                SAR {booking.price_sar}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
              <p className="font-medium text-foreground">{locationName}</p>
              {address && <p className="text-sm text-secondary mt-1">{address}</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
