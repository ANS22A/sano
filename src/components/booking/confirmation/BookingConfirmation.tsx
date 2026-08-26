'use client'

import { cn } from '@/lib/utils/cn'
import { Link } from '@/i18n/navigation'
import { generateICSContent, downloadICS } from '@/lib/booking/ics'
import type { BookingResult } from '@/data/booking.types'
import { formatAppointmentTime } from '@/lib/utils/format'

interface BookingConfirmationProps {
  result: BookingResult
  isAr: boolean
}

function formatConfirmDate(dateStr: string, isAr: boolean): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

export function BookingConfirmation({ result, isAr }: BookingConfirmationProps) {
  const t = {
    title: isAr ? 'تم تأكيد حجزك ✓' : 'Booking Confirmed ✓',
    subtitle: isAr ? 'نتطلع لاستقبالك بكل ترحيب.' : 'We look forward to welcoming you.',
    bookingNumber: isAr ? 'رقم الحجز' : 'Booking Number',
    service: isAr ? 'التجربة' : 'Experience',
    dateTime: isAr ? 'التاريخ والوقت' : 'Date & Time',
    location: isAr ? 'الموقع' : 'Location',
    total: isAr ? 'الإجمالي' : 'Total',
    customer: isAr ? 'التواصل' : 'Contact',
    calendar: isAr ? 'أضف إلى التقويم' : 'Add to Calendar',
    home: isAr ? 'العودة للرئيسية' : 'Back to Home',
    questions: isAr ? 'أي استفسار؟' : 'Questions?',
    contact: isAr ? 'تواصلي معنا' : 'Contact us',
    sar: isAr ? 'ريال' : 'SAR',
  }

  const serviceName = isAr ? result.serviceName_ar : result.serviceName_en
  const locationName = isAr ? result.locationName_ar : result.locationName_en
  const address = isAr ? result.address_ar : result.address_en

  const handleICS = () => {
    const content = generateICSContent({
      uid: result.bookingNumber,
      summary: `SANO LUNA — ${serviceName}`,
      description: isAr
        ? `حجزك في سانو لونا\nالخدمة: ${serviceName}\nالسعر: ${result.priceSar} ريال`
        : `Your SANO LUNA booking\nService: ${serviceName}\nPrice: ${result.priceSar} SAR`,
      location: address,
      startDate: result.date,
      startTime: result.startTime,
      endTime: result.endTime,
    })
    downloadICS(content, `sanoluna-${result.bookingNumber}.ics`)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8 max-w-lg mx-auto text-center">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="13" stroke="var(--muted-foreground)" strokeWidth="1.5" />
          <path d="M8 14l4 4 8-8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-foreground">{t.title}</h1>
        <p className="text-[var(--color-text-muted)]">{t.subtitle}</p>
      </div>

      {/* Booking number */}
      <div className="w-full px-6 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-sm">
        <p className="text-xs text-[var(--color-text-muted)] tracking-widest uppercase mb-1">{t.bookingNumber}</p>
        <p className="text-2xl font-mono font-semibold text-foreground tracking-wider">
          {result.bookingNumber}
        </p>
      </div>

      {/* Booking details */}
      <dl className="w-full text-start border border-[var(--border-subtle)] rounded-sm overflow-hidden divide-y divide-[var(--border-subtle)]">
        {[
          { label: t.service, value: serviceName },
          {
            label: t.dateTime,
            value: `${formatConfirmDate(result.date, isAr)}, ${formatAppointmentTime(result.startTime, isAr ? 'ar' : 'en')}${result.endTime ? ` — ${formatAppointmentTime(result.endTime, isAr ? 'ar' : 'en')}` : ''}`,
          },
          { label: t.location, value: `${locationName}\n${address}` },
          { label: t.customer, value: `${result.customerName}\n${result.customerPhone}\n${result.customerEmail}` },
          {
            label: t.total,
            value: `${result.priceSar} ${t.sar}`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-start gap-4 px-4 py-3">
            <dt className="text-xs text-[var(--color-text-muted)] shrink-0 mt-0.5">{label}</dt>
            <dd className="text-sm text-foreground font-medium whitespace-pre-line text-end">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          onClick={handleICS}
          className={cn(
            'flex-1 px-5 py-3 border border-[var(--border-subtle)] rounded-sm text-sm',
            'hover:bg-[var(--surface)] transition-colors text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
            'flex items-center justify-center gap-2'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {t.calendar}
        </button>
        <Link
          href="/"
          className={cn(
            'flex-1 px-5 py-3 bg-foreground text-white rounded-sm text-sm text-center',
            'hover:bg-foreground transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2'
          )}
        >
          {t.home}
        </Link>
      </div>

      {/* Contact */}
      <p className="text-sm text-[var(--color-text-muted)]">
        {t.questions}{' '}
        <Link href="/contact" className="underline underline-offset-2 hover:text-foreground transition-colors">
          {t.contact}
        </Link>
      </p>
    </div>
  )
}

