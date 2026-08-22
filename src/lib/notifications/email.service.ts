import 'server-only'
import { Resend } from 'resend'
import { contactConfig } from '@/config/site.config'

let resend: Resend | null = null

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (e) {
  console.error('[EmailService] Failed to initialize Resend client:', e)
}

const defaultFrom = process.env.RESEND_FROM_EMAIL || 'SANO LUNA <no-reply@sanoluna.com>'
export const brandGold = '#D4AF37'
export const brandPurple = '#2E1F38'
export const brandMauve = '#6F4E7C'
export const brandLavender = '#A98FB8'
export const brandPinkMauve = '#D6C2D9'
export const brandLightLilac = '#E7DBEC'
export const brandBg = '#FAF7F4'

export interface EmailBookingDetails {
  bookingNumber: string
  date: string
  startTime: string
  durationMinutes?: number
  serviceNameAr: string
  serviceNameEn: string
  locationNameAr: string
  locationNameEn: string
  customerName: string
  customerEmail?: string | null
  priceSar: number
  status?: string
  locale?: 'en' | 'ar'
  cancellationReason?: string
  oldDate?: string
  oldStartTime?: string
  notes?: string
}

function getBaseTemplate(title: string, content: string, locale: 'en' | 'ar' = 'en') {
  const isRtl = locale === 'ar'
  const dir = isRtl ? 'rtl' : 'ltr'
  const align = isRtl ? 'right' : 'left'
  const contact = contactConfig
  const fontFamily = isRtl
    ? "'Tajawal', 'Cairo', Tahoma, Arial, sans-serif"
    : "'Montserrat', 'Helvetica Neue', Arial, sans-serif"

  return `
    <!DOCTYPE html>
    <html lang="${locale}" dir="${dir}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body, table, td, p, a, li, blockquote {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
      </style>
    </head>
    <body style="font-family: ${fontFamily}; background-color: #FAF7F4; color: ${brandPurple}; line-height: 1.7; margin: 0; padding: 24px 12px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F4;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid ${brandLightLilac}; box-shadow: 0 4px 20px rgba(46, 31, 56, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: ${brandPurple}; padding: 36px 24px; text-align: center;">
                  <h1 style="color: ${brandGold}; margin: 0; font-family: 'Cinzel', ${fontFamily}; font-size: 26px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase;">SANO LUNA</h1>
                  <p style="color: ${brandPinkMauve}; margin: 6px 0 0 0; font-size: 14px; letter-spacing: 1px;">سانو لونا — سبا منزلي فاخر</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 36px 28px; text-align: ${align};" dir="${dir}">
                  ${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #FAF7F4; border-top: 1px solid ${brandLightLilac}; padding: 24px; text-align: center; font-size: 13px; color: ${brandMauve};">
                  <p style="margin: 0 0 8px 0; font-weight: 500;">${isRtl ? 'لأي استفسار أو مساعدة، يرجى التواصل معنا عبر:' : 'For any inquiries or assistance, please reach out to us at:'}</p>
                  <p style="margin: 0; color: ${brandPurple}; font-weight: 600;">
                    <a href="mailto:${contact.email}" style="color: ${brandMauve}; text-decoration: none;">${contact.email}</a>
                    &nbsp;|&nbsp;
                    <a href="tel:${contact.phone}" style="color: ${brandMauve}; text-decoration: none;" dir="ltr">${contact.phone}</a>
                  </p>
                  <p style="margin: 16px 0 0 0; font-size: 11px; color: ${brandLavender};">© ${new Date().getFullYear()} SANO LUNA. All rights reserved.</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * 1. Send Booking Created / Received Notification Email
 */
export async function sendBookingCreated(details: EmailBookingDetails): Promise<{ success: boolean; error?: string }> {
  if (!resend || !details.customerEmail || !details.customerEmail.includes('@')) {
    return { success: true }
  }

  const isRtl = details.locale === 'ar'
  const subject = isRtl
    ? `تم استلام طلب حجزك - سانو لونا #${details.bookingNumber}`
    : `Booking Request Received - SANO LUNA #${details.bookingNumber}`

  const durationStr = details.durationMinutes
    ? (isRtl ? `${details.durationMinutes} دقيقة` : `${details.durationMinutes} mins`)
    : ''

  const locationName = isRtl ? (details.locationNameAr || 'الرياض') : (details.locationNameEn || 'Riyadh')

  const content = isRtl
    ? `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">مرحباً ${details.customerName}،</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">تم استلام طلب حجزك بنجاح في سانو لونا. سنقوم بمراجعة الطلب وتأكيده لك في أقرب وقت.</p>
      
      <div style="background-color: #FAF7F4; border: 1px solid ${brandLightLilac}; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600; width: 35%;">رقم الحجز:</td>
            <td style="font-weight: 700; color: ${brandPurple}; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الخدمة:</td>
            <td style="font-weight: 600;">${details.serviceNameAr || details.serviceNameEn}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">التاريخ:</td>
            <td>${details.date}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الوقت:</td>
            <td dir="ltr" style="text-align: right;">${details.startTime.slice(0, 5)} ${durationStr ? `(${durationStr})` : ''}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">المنطقة / الموقع:</td>
            <td>${locationName}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">المبلغ الإجمالي:</td>
            <td style="color: ${brandGold}; font-weight: 700; font-size: 15px;">${details.priceSar} ريال سعودي</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الحالة:</td>
            <td><span style="background-color: #FEF9C3; color: #854D0E; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">قيد المعالجة</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">شكراً لاختيارك سانو لونا. نتطلع لتقديم تجربة استرخاء لا تُنسى في راحة منزلك.</p>
    `
    : `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">Hello ${details.customerName},</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">We have received your booking request at SANO LUNA. Our team will review and confirm your reservation shortly.</p>
      
      <div style="background-color: #FAF7F4; border: 1px solid ${brandLightLilac}; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600; width: 35%;">Booking Ref:</td>
            <td style="font-weight: 700; color: ${brandPurple}; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Experience:</td>
            <td style="font-weight: 600;">${details.serviceNameEn || details.serviceNameAr}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Date:</td>
            <td>${details.date}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Time:</td>
            <td>${details.startTime.slice(0, 5)} ${durationStr ? `(${durationStr})` : ''}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Location:</td>
            <td>${locationName}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Total Price:</td>
            <td style="color: ${brandGold}; font-weight: 700; font-size: 15px;">SAR ${details.priceSar}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Status:</td>
            <td><span style="background-color: #FEF9C3; color: #854D0E; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">Pending</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">Thank you for choosing SANO LUNA. We look forward to delivering a tranquil luxury spa experience in the comfort of your home.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('[EmailService] Failed to send booking created email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * 2. Send Booking Confirmation Notification Email
 */
export async function sendBookingConfirmation(details: EmailBookingDetails): Promise<{ success: boolean; error?: string }> {
  if (!resend || !details.customerEmail || !details.customerEmail.includes('@')) {
    return { success: true }
  }

  const isRtl = details.locale === 'ar'
  const subject = isRtl 
    ? `تأكيد الحجز - سانو لونا #${details.bookingNumber}`
    : `Booking Confirmation - SANO LUNA #${details.bookingNumber}`

  const durationStr = details.durationMinutes
    ? (isRtl ? `${details.durationMinutes} دقيقة` : `${details.durationMinutes} mins`)
    : ''

  const locationName = isRtl ? (details.locationNameAr || 'الرياض') : (details.locationNameEn || 'Riyadh')

  const content = isRtl
    ? `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">مرحباً ${details.customerName}،</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">يسعدنا إعلامك بأنه تم تأكيد حجزك بنجاح. نحن بانتظارك في سانو لونا لتجربة استثنائية من العناية والاسترخاء.</p>
      
      <div style="background-color: #FAF7F4; border: 1px solid ${brandLightLilac}; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600; width: 35%;">رقم الحجز:</td>
            <td style="font-weight: 700; color: ${brandPurple}; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الخدمة:</td>
            <td style="font-weight: 600;">${details.serviceNameAr || details.serviceNameEn}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">التاريخ:</td>
            <td>${details.date}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الوقت:</td>
            <td dir="ltr" style="text-align: right;">${details.startTime.slice(0, 5)} ${durationStr ? `(${durationStr})` : ''}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الموقع / المنطقة:</td>
            <td>${locationName}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">المبلغ الإجمالي:</td>
            <td style="color: ${brandGold}; font-weight: 700; font-size: 15px;">${details.priceSar} ريال سعودي</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الحالة:</td>
            <td><span style="background-color: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">مؤكد</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">إذا كنت بحاجة إلى أي تعديل، يرجى التواصل معنا قبل موعد الجلسة بوقت كافٍ.</p>
      <p style="color: ${brandMauve}; font-size: 14px;">شكراً لاختيارك سانو لونا.</p>
    `
    : `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">Hello ${details.customerName},</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">Your booking has been successfully confirmed. We look forward to welcoming you for an exceptional home spa experience.</p>
      
      <div style="background-color: #FAF7F4; border: 1px solid ${brandLightLilac}; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600; width: 35%;">Booking Ref:</td>
            <td style="font-weight: 700; color: ${brandPurple}; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Experience:</td>
            <td style="font-weight: 600;">${details.serviceNameEn || details.serviceNameAr}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Date:</td>
            <td>${details.date}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Time:</td>
            <td>${details.startTime.slice(0, 5)} ${durationStr ? `(${durationStr})` : ''}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Location:</td>
            <td>${locationName}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Total Price:</td>
            <td style="color: ${brandGold}; font-weight: 700; font-size: 15px;">SAR ${details.priceSar}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Status:</td>
            <td><span style="background-color: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">Confirmed</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">If you need to modify your booking, please reach out to us with sufficient notice.</p>
      <p style="color: ${brandMauve}; font-size: 14px;">Thank you for choosing SANO LUNA.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('[EmailService] Failed to send confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * 3. Send Booking Cancellation Notification Email
 */
export async function sendBookingCancellation(details: EmailBookingDetails): Promise<{ success: boolean; error?: string }> {
  if (!resend || !details.customerEmail || !details.customerEmail.includes('@')) {
    return { success: true }
  }

  const isRtl = details.locale === 'ar'
  const subject = isRtl 
    ? `إلغاء الحجز - سانو لونا #${details.bookingNumber}`
    : `Booking Cancellation - SANO LUNA #${details.bookingNumber}`
  
  const reasonText = details.cancellationReason 
    ? (isRtl ? `<tr><td style="color: #991b1b; font-weight: 600;">سبب الإلغاء:</td><td>${details.cancellationReason}</td></tr>` : `<tr><td style="color: #991b1b; font-weight: 600;">Reason:</td><td>${details.cancellationReason}</td></tr>`)
    : ''

  const content = isRtl
    ? `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">مرحباً ${details.customerName}،</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">نود إعلامك بأنه تم إلغاء حجزك في سانو لونا وفق التفاصيل أدناه:</p>
      
      <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: #991B1B; font-weight: 600; width: 35%;">رقم الحجز:</td>
            <td style="font-weight: 700; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">الخدمة:</td>
            <td style="font-weight: 600;">${details.serviceNameAr || details.serviceNameEn}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">التاريخ:</td>
            <td>${details.date}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">الوقت:</td>
            <td dir="ltr" style="text-align: right;">${details.startTime.slice(0, 5)}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">الحالة:</td>
            <td><span style="background-color: #FEE2E2; color: #B91C1C; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">ملغي</span></td>
          </tr>
          ${reasonText}
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">نتمنى أن نراك قريباً في سانو لونا لحجز تجربة جديدة.</p>
    `
    : `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">Hello ${details.customerName},</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">We are writing to confirm that your booking with SANO LUNA has been cancelled according to the details below:</p>
      
      <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: #991B1B; font-weight: 600; width: 35%;">Booking Ref:</td>
            <td style="font-weight: 700; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">Experience:</td>
            <td style="font-weight: 600;">${details.serviceNameEn || details.serviceNameAr}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">Date:</td>
            <td>${details.date}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">Time:</td>
            <td>${details.startTime.slice(0, 5)}</td>
          </tr>
          <tr>
            <td style="color: #991B1B; font-weight: 600;">Status:</td>
            <td><span style="background-color: #FEE2E2; color: #B91C1C; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">Cancelled</span></td>
          </tr>
          ${reasonText}
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">We look forward to welcoming you to SANO LUNA for a future ritual.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('[EmailService] Failed to send cancellation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * 4. Send Booking Reschedule / Details Updated Notification Email
 */
export async function sendBookingReschedule(details: EmailBookingDetails): Promise<{ success: boolean; error?: string }> {
  if (!resend || !details.customerEmail || !details.customerEmail.includes('@')) {
    return { success: true }
  }

  const isRtl = details.locale === 'ar'
  const subject = isRtl 
    ? `تحديث موعد الحجز - سانو لونا #${details.bookingNumber}`
    : `Booking Rescheduled - SANO LUNA #${details.bookingNumber}`
  
  const content = isRtl
    ? `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">مرحباً ${details.customerName}،</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">تم تعديل موعد حجزك بنجاح في سانو لونا. إليك التفاصيل المحدثة:</p>
      
      <div style="background-color: #FAF7F4; border: 1px solid ${brandLightLilac}; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600; width: 35%;">رقم الحجز:</td>
            <td style="font-weight: 700; color: ${brandPurple}; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الخدمة:</td>
            <td style="font-weight: 600;">${details.serviceNameAr || details.serviceNameEn}</td>
          </tr>
          ${details.oldDate ? `
          <tr>
            <td style="color: #6F4E7C; font-weight: 600;">الموعد السابق:</td>
            <td style="color: #6F4E7C; text-decoration: line-through;">${details.oldDate} الساعة ${details.oldStartTime?.slice(0, 5)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: #166534; font-weight: 700;">الموعد الجديد:</td>
            <td style="color: #166534; font-weight: 700;">${details.date}</td>
          </tr>
          <tr>
            <td style="color: #166534; font-weight: 700;">الوقت الجديد:</td>
            <td dir="ltr" style="text-align: right; color: #166534; font-weight: 700;">${details.startTime.slice(0, 5)}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الموقع:</td>
            <td>${details.locationNameAr || 'الرياض'}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">الحالة:</td>
            <td><span style="background-color: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">محدث ومؤكد</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">شكراً لاختيارك سانو لونا. نحن بانتظارك!</p>
    `
    : `
      <h2 style="color: ${brandPurple}; margin-top: 0; font-size: 20px; font-weight: 600;">Hello ${details.customerName},</h2>
      <p style="color: ${brandMauve}; font-size: 15px;">Your booking with SANO LUNA has been successfully updated. Here are your new details:</p>
      
      <div style="background-color: #FAF7F4; border: 1px solid ${brandLightLilac}; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: ${brandPurple};">
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600; width: 35%;">Booking Ref:</td>
            <td style="font-weight: 700; color: ${brandPurple}; font-family: monospace;">${details.bookingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Experience:</td>
            <td style="font-weight: 600;">${details.serviceNameEn || details.serviceNameAr}</td>
          </tr>
          ${details.oldDate ? `
          <tr>
            <td style="color: #6F4E7C; font-weight: 600;">Previous Time:</td>
            <td style="color: #6F4E7C; text-decoration: line-through;">${details.oldDate} at ${details.oldStartTime?.slice(0, 5)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: #166534; font-weight: 700;">New Date:</td>
            <td style="color: #166534; font-weight: 700;">${details.date}</td>
          </tr>
          <tr>
            <td style="color: #166534; font-weight: 700;">New Time:</td>
            <td style="color: #166534; font-weight: 700;">${details.startTime.slice(0, 5)}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Location:</td>
            <td>${details.locationNameEn || 'Riyadh'}</td>
          </tr>
          <tr>
            <td style="color: ${brandMauve}; font-weight: 600;">Status:</td>
            <td><span style="background-color: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">Updated</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${brandMauve}; font-size: 14px;">Thank you for choosing SANO LUNA. We look forward to your session.</p>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: details.customerEmail,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('[EmailService] Failed to send reschedule email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export interface EmailGiftCardDetails {
  code: string
  amount: number
  recipientName: string
  recipientEmail: string
  senderName: string
  senderEmail: string
  personalMessage?: string | null
  expiresAt: string
  locale?: 'en' | 'ar'
}

export async function sendGiftCardEmail(details: EmailGiftCardDetails) {
  if (!resend) {
    console.warn('[EmailService] Resend not configured. Skipping gift card email.')
    return { success: false, error: 'Email service unconfigured' }
  }

  const isRtl = details.locale === 'ar'
  const subject = isRtl
    ? `بطاقة إهداء فاخرة من ${details.senderName} عبر سانو لونا 🎁`
    : `A luxury gift voucher from ${details.senderName} via SANO LUNA 🎁`

  const content = isRtl
    ? `
      <p style="font-size: 16px; color: ${brandPurple}; margin-top: 0;">عزيزتي <strong>${details.recipientName}</strong>،</p>
      <p style="font-size: 14px; color: ${brandMauve};">
        يسعدنا إبلاغك بأن <strong>${details.senderName}</strong> قد أهدتكِ تجربة استرخاء فاخرة من سانو لونا.
      </p>

      ${details.personalMessage ? `
      <div style="background-color: #FAF7F4; border-right: 4px solid ${brandGold}; padding: 16px; border-radius: 8px; margin: 20px 0; font-style: italic; color: ${brandPurple};">
        "${details.personalMessage}"
        <div style="text-align: left; font-size: 12px; color: ${brandMauve}; margin-top: 8px;">— ${details.senderName}</div>
      </div>
      ` : ''}

      <div style="background-color: #2E1F38; color: #FAF7F4; border-radius: 16px; padding: 28px 24px; text-align: center; margin: 24px 0; border: 1px solid ${brandGold}; box-shadow: 0 4px 16px rgba(46,31,56,0.15);">
        <div style="font-size: 12px; letter-spacing: 2px; color: ${brandGold}; text-transform: uppercase; margin-bottom: 8px;">بطاقة إهداء سانو لونا | GIFT VOUCHER</div>
        <div style="font-size: 32px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">${details.amount} <span style="font-size: 18px; color: ${brandGold};">ريال سعودي</span></div>
        <div style="background-color: rgba(255,255,255,0.08); border: 1px dashed ${brandGold}; border-radius: 10px; padding: 12px 16px; font-family: monospace; font-size: 22px; font-weight: 700; color: ${brandGold}; letter-spacing: 3px; display: inline-block; margin-bottom: 12px; direction: ltr;">
          ${details.code}
        </div>
        <div style="font-size: 11px; color: ${brandPinkMauve};">صالحة لغاية: ${new Date(details.expiresAt).toLocaleDateString('ar-SA')}</div>
      </div>

      <p style="font-size: 14px; color: ${brandMauve}; line-height: 1.6;">
        <strong>طريقة الاستخدام:</strong> يمكنكِ استخدام هذا الرمز عند حجز أي من جلسات السبا أو المساج الفاخرة عبر موقعنا الإلكتروني، وسيتم خصم المبلغ مباشرة من قيمة الحجز.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sanoluna.com'}/ar/gift-cards/${details.code}" style="background-color: ${brandPurple}; color: ${brandGold}; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block; border: 1px solid ${brandGold};">
          عرض كرت الإهداء
        </a>
      </div>
      <div style="text-align: center; margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sanoluna.com'}/ar/booking" style="color: ${brandMauve}; text-decoration: underline; font-size: 13px;">
          احجزي جلستكِ الآن
        </a>
      </div>
    `
    : `
      <p style="font-size: 16px; color: ${brandPurple}; margin-top: 0;">Dear <strong>${details.recipientName}</strong>,</p>
      <p style="font-size: 14px; color: ${brandMauve};">
        We are delighted to let you know that <strong>${details.senderName}</strong> has gifted you a luxury SANO LUNA home spa experience.
      </p>

      ${details.personalMessage ? `
      <div style="background-color: #FAF7F4; border-left: 4px solid ${brandGold}; padding: 16px; border-radius: 8px; margin: 20px 0; font-style: italic; color: ${brandPurple};">
        "${details.personalMessage}"
        <div style="text-align: right; font-size: 12px; color: ${brandMauve}; margin-top: 8px;">— ${details.senderName}</div>
      </div>
      ` : ''}

      <div style="background-color: #2E1F38; color: #FAF7F4; border-radius: 16px; padding: 28px 24px; text-align: center; margin: 24px 0; border: 1px solid ${brandGold}; box-shadow: 0 4px 16px rgba(46,31,56,0.15);">
        <div style="font-size: 12px; letter-spacing: 2px; color: ${brandGold}; text-transform: uppercase; margin-bottom: 8px;">SANO LUNA GIFT VOUCHER</div>
        <div style="font-size: 32px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">${details.amount} <span style="font-size: 18px; color: ${brandGold};">SAR</span></div>
        <div style="background-color: rgba(255,255,255,0.08); border: 1px dashed ${brandGold}; border-radius: 10px; padding: 12px 16px; font-family: monospace; font-size: 22px; font-weight: 700; color: ${brandGold}; letter-spacing: 3px; display: inline-block; margin-bottom: 12px;">
          ${details.code}
        </div>
        <div style="font-size: 11px; color: ${brandPinkMauve};">Valid until: ${new Date(details.expiresAt).toLocaleDateString('en-GB')}</div>
      </div>

      <p style="font-size: 14px; color: ${brandMauve}; line-height: 1.6;">
        <strong>How to Redeem:</strong> Simply enter this voucher code during checkout when booking any of our luxury home spa services, and the amount will be applied to your balance.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sanoluna.com'}/en/gift-cards/${details.code}" style="background-color: ${brandPurple}; color: ${brandGold}; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block; border: 1px solid ${brandGold};">
          View Gift Card
        </a>
      </div>
      <div style="text-align: center; margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sanoluna.com'}/en/booking" style="color: ${brandMauve}; text-decoration: underline; font-size: 13px;">
          Book Your Experience
        </a>
      </div>
    `

  const html = getBaseTemplate(subject, content, details.locale)

  try {
    // Send to recipient
    await resend.emails.send({
      from: defaultFrom,
      to: details.recipientEmail,
      subject,
      html,
    })

    // Also send receipt copy to sender if senderEmail provided
    if (details.senderEmail && details.senderEmail !== details.recipientEmail) {
      const receiptSubject = isRtl
        ? `تأكيد شراء بطاقة إهداء سانو لونا — ${details.code}`
        : `SANO LUNA Gift Voucher Purchase Confirmation — ${details.code}`
      await resend.emails.send({
        from: defaultFrom,
        to: details.senderEmail,
        subject: receiptSubject,
        html,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('[EmailService] Failed to send gift card email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
