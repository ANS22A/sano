import 'server-only'
import { Resend } from 'resend'
import { contactConfig } from '@/config/site.config'

// Define the expected environment variables for documentation
// RESEND_API_KEY
// RESEND_FROM_EMAIL

let resend: Resend | null = null

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (e) {
  console.error('[EmailService] Failed to initialize Resend', e)
}

const defaultFrom = process.env.RESEND_FROM_EMAIL || 'no-reply@sanoluna.com'
const brandColor = '#D4AF37'
const textColor = '#2E1F38'

export interface EmailBookingDetails {
  bookingNumber: string
  date: string
  startTime: string
  serviceNameAr: string
  serviceNameEn: string
  locationNameAr: string
  locationNameEn: string
  customerName: string
  customerEmail: string
  priceSar: number
  locale?: 'en' | 'ar'
  cancellationReason?: string
  oldDate?: string
  oldStartTime?: string
}

function getBaseTemplate(title: string, content: string, locale: 'en' | 'ar' = 'en') {
  const isRtl = locale === 'ar'
  const dir = isRtl ? 'rtl' : 'ltr'
  const align = isRtl ? 'right' : 'left'
  const contact = contactConfig

  return `
    <!DOCTYPE html>
    <html lang="${locale}" dir="${dir}">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #E7DBEC; color: ${textColor}; line-height: 1.6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #A98FB8;">
        <div style="background-color: #2E1F38; padding: 30px; text-align: center;">
          <h1 style="color: ${brandColor}; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 2px;">SANO LUNA</h1>
          <p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 14px;">سانو لونا</p>
        </div>
        
        <div style="padding: 40px 30px; text-align: ${align};">
          ${content}
        </div>
        
        <div style="background-color: #D6C2D9; padding: 20px; text-align: center; font-size: 13px; color: #7a6a57;">
          <p style="margin: 0 0 10px 0;">${isRtl ? 'لأي استفسار، يرجى التواصل معنا عبر' : 'For any inquiries, please contact us at'}:</p>
          <p style="margin: 0;">${contact.email} | ${contact.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send Booking Confirmation Email
 */
export async function sendBookingConfirmation(details: EmailBookingDetails) {
  if (!resend || !details.customerEmail) return { success: true } // Fail open

  const isRtl = details.locale === 'ar'
  const subject = isRtl 
    ? `تأكيد الحجز - سانو لونا #${details.bookingNumber}`
    : `Booking Confirmation - SANO LUNA #${details.bookingNumber}`
  
  const content = isRtl
    ? `
      <h2 style="color: ${brandColor}; margin-top: 0;">مرحباً ${details.customerName}،</h2>
      <p>تم تأكيد حجزك بنجاح. نحن بانتظارك في سانو لونا لتجربة استثنائية.</p>
      
      <div style="background-color: #E7DBEC; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;"><strong>رقم الحجز:</strong> ${details.bookingNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>الخدمة:</strong> ${details.serviceNameAr}</p>
        <p style="margin: 0 0 10px 0;"><strong>التاريخ:</strong> ${details.date}</p>
        <p style="margin: 0 0 10px 0;"><strong>الوقت:</strong> ${details.startTime}</p>
        <p style="margin: 0 0 10px 0;"><strong>الموقع:</strong> ${details.locationNameAr}</p>
        <p style="margin: 0;"><strong>المبلغ:</strong> ${details.priceSar} ريال</p>
      </div>
      
      <p>إذا كنت بحاجة إلى تعديل أو إلغاء حجزك، يرجى التواصل معنا.</p>
      <p>شكراً لاختيارك سانو لونا.</p>
    `
    : `
      <h2 style="color: ${brandColor}; margin-top: 0;">Hello ${details.customerName},</h2>
      <p>Your booking has been successfully confirmed. We look forward to welcoming you for an exceptional experience.</p>
      
      <div style="background-color: #E7DBEC; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Booking Ref:</strong> ${details.bookingNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>Experience:</strong> ${details.serviceNameEn}</p>
        <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${details.date}</p>
        <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${details.startTime}</p>
        <p style="margin: 0 0 10px 0;"><strong>Location:</strong> ${details.locationNameEn}</p>
        <p style="margin: 0;"><strong>Price:</strong> SAR ${details.priceSar}</p>
      </div>
      
      <p>If you need to modify or cancel your booking, please contact us.</p>
      <p>Thank you for choosing SANO LUNA.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error('[EmailService] Failed to send confirmation email:', error)
  }
}

/**
 * Send Booking Cancellation Email
 */
export async function sendBookingCancellation(details: EmailBookingDetails) {
  if (!resend || !details.customerEmail) return { success: true }

  const isRtl = details.locale === 'ar'
  const subject = isRtl 
    ? `إلغاء الحجز - سانو لونا #${details.bookingNumber}`
    : `Booking Cancellation - SANO LUNA #${details.bookingNumber}`
  
  const reasonText = details.cancellationReason 
    ? (isRtl ? `<p><strong>سبب الإلغاء:</strong> ${details.cancellationReason}</p>` : `<p><strong>Reason:</strong> ${details.cancellationReason}</p>`)
    : ''

  const content = isRtl
    ? `
      <h2 style="color: #991b1b; margin-top: 0;">مرحباً ${details.customerName}،</h2>
      <p>نود إعلامك بأنه تم إلغاء حجزك بنجاح.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;"><strong>رقم الحجز:</strong> ${details.bookingNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>الخدمة:</strong> ${details.serviceNameAr}</p>
        <p style="margin: 0 0 10px 0;"><strong>التاريخ:</strong> ${details.date}</p>
        <p style="margin: 0;"><strong>الوقت:</strong> ${details.startTime}</p>
        ${reasonText}
      </div>
      
      <p>نتمنى أن نراك قريباً في سانو لونا.</p>
    `
    : `
      <h2 style="color: #991b1b; margin-top: 0;">Hello ${details.customerName},</h2>
      <p>We are writing to confirm that your booking has been cancelled.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Booking Ref:</strong> ${details.bookingNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>Experience:</strong> ${details.serviceNameEn}</p>
        <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${details.date}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${details.startTime}</p>
        ${reasonText}
      </div>
      
      <p>We hope to welcome you to SANO LUNA in the future.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error('[EmailService] Failed to send cancellation email:', error)
  }
}

/**
 * Send Booking Reschedule Email
 */
export async function sendBookingReschedule(details: EmailBookingDetails) {
  if (!resend || !details.customerEmail) return { success: true }

  const isRtl = details.locale === 'ar'
  const subject = isRtl 
    ? `تعديل موعد الحجز - سانو لونا #${details.bookingNumber}`
    : `Booking Rescheduled - SANO LUNA #${details.bookingNumber}`
  
  const content = isRtl
    ? `
      <h2 style="color: ${brandColor}; margin-top: 0;">مرحباً ${details.customerName}،</h2>
      <p>تم تعديل موعد حجزك بنجاح. إليك التفاصيل المحدثة:</p>
      
      <div style="background-color: #E7DBEC; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;"><strong>رقم الحجز:</strong> ${details.bookingNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>الخدمة:</strong> ${details.serviceNameAr}</p>
        ${details.oldDate ? `<p style="margin: 0 0 10px 0; color: #7a6a57; text-decoration: line-through;">الموعد السابق: ${details.oldDate} الساعة ${details.oldStartTime}</p>` : ''}
        <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;"><strong>الموعد الجديد:</strong> ${details.date}</p>
        <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;"><strong>الوقت الجديد:</strong> ${details.startTime}</p>
        <p style="margin: 0;"><strong>الموقع:</strong> ${details.locationNameAr}</p>
      </div>
      
      <p>شكراً لاختيارك سانو لونا.</p>
    `
    : `
      <h2 style="color: ${brandColor}; margin-top: 0;">Hello ${details.customerName},</h2>
      <p>Your booking has been successfully rescheduled. Here are your updated details:</p>
      
      <div style="background-color: #E7DBEC; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Booking Ref:</strong> ${details.bookingNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>Experience:</strong> ${details.serviceNameEn}</p>
        ${details.oldDate ? `<p style="margin: 0 0 10px 0; color: #7a6a57; text-decoration: line-through;">Previous Time: ${details.oldDate} at ${details.oldStartTime}</p>` : ''}
        <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;"><strong>New Date:</strong> ${details.date}</p>
        <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;"><strong>New Time:</strong> ${details.startTime}</p>
        <p style="margin: 0;"><strong>Location:</strong> ${details.locationNameEn}</p>
      </div>
      
      <p>Thank you for choosing SANO LUNA.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error('[EmailService] Failed to send reschedule email:', error)
  }
}

