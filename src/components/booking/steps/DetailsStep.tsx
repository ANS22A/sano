'use client'

import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'
import type { BookingDraft, BookingCustomer } from '@/data/booking.types'

const saudiPhoneRegex = /^(\+966|0966|966|0)?(5\d{8})$/

const schema = z.object({
  fullName: z.string().min(2, 'name_short').max(100, 'name_long').trim(),
  phone: z.string().regex(saudiPhoneRegex, 'phone_invalid').min(1, 'phone_required'),
  email: z.string().email('email_invalid').min(1, 'email_required'),
  address: z.string().min(5, 'address_short').max(200, 'address_long').trim(),
  notes: z.string().max(500, 'notes_long').default(''),
})

type FormData = z.infer<typeof schema>

interface DetailsStepProps {
  draft: BookingDraft
  onUpdate: (patch: Partial<BookingDraft>) => void
  onContinue: () => void
  onBack: () => void
  isAr: boolean
}

export function DetailsStep({ draft, onUpdate, onContinue, onBack, isAr }: DetailsStepProps) {
  const t = {
    title: isAr ? 'بياناتك' : 'Your Details',
    subtitle: isAr ? 'كيف يمكننا التواصل معك؟' : 'How can we reach you?',
    fullName: isAr ? 'الاسم الكامل' : 'Full Name',
    fullNamePlaceholder: isAr ? 'اسمك الكامل' : 'Your full name',
    phone: isAr ? 'رقم الجوال' : 'Phone Number',
    phonePlaceholder: '055 185 4617',
    email: isAr ? 'البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: isAr ? 'بريدك@example.com' : 'your@email.com',
    address: isAr ? 'عنوان المنزل (جدة)' : 'Home Address (Jeddah)',
    addressPlaceholder: isAr ? 'الحي، الشارع، رقم المبنى' : 'Neighborhood, Street, Building No.',
    notes: isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)',
    notesPlaceholder: isAr ? 'أي تفضيلات أو طلبات خاصة؟' : 'Any preferences or special requests?',
    continue: isAr ? 'متابعة' : 'Continue',
    back: isAr ? 'رجوع' : 'Back',
    privacy: isAr ? 'معلوماتك محفوظة وآمنة تماماً.' : 'Your information is kept private and secure.',
    errors: {
      name_short: isAr ? 'الاسم قصير جداً' : 'Name is too short',
      name_long: isAr ? 'الاسم طويل جداً' : 'Name is too long',
      phone_invalid: isAr ? 'رقم جوال سعودي غير صحيح' : 'Enter a valid Saudi phone',
      phone_required: isAr ? 'رقم الجوال مطلوب' : 'Phone number is required',
      email_invalid: isAr ? 'بريد إلكتروني غير صحيح' : 'Enter a valid email address',
      email_required: isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required',
      address_short: isAr ? 'العنوان قصير جداً' : 'Address is too short',
      address_long: isAr ? 'العنوان طويل جداً' : 'Address is too long',
    } as Record<string, string>,
  }

  // Inject address into default values if not present
  const defaultValues = { ...draft.customer, address: draft.customer?.address || '' }

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues,
  })

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const customer: BookingCustomer = {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes ?? '',
    }
    onUpdate({ customer })
    onContinue()
  }

  const inputClass = (hasError: boolean) => cn(
    'w-full h-11 px-4 border rounded-sm text-sm bg-background text-foreground',
    'placeholder:text-[var(--color-text-muted)] transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
    hasError
      ? 'border-red-400 focus:ring-red-300'
      : 'border-[var(--border-subtle)] focus:border-primary'
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl text-foreground">{t.title}</h2>
        <p className="text-[var(--color-text-muted)] text-sm">{t.subtitle}</p>
      </div>

      <div className="space-y-4 max-w-lg">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-sm font-medium text-foreground">
            {t.fullName} <span aria-hidden="true" className="text-border">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            dir={isAr ? 'rtl' : 'ltr'}
            placeholder={t.fullNamePlaceholder}
            autoComplete="name"
            aria-required="true"
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
            className={inputClass(!!errors.fullName)}
          />
          {errors.fullName && (
            <p id="fullName-error" role="alert" className="text-xs text-red-500">
              {t.errors[errors.fullName.message ?? ''] ?? errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            {t.phone} <span aria-hidden="true" className="text-border">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            placeholder={t.phonePlaceholder}
            autoComplete="tel"
            inputMode="tel"
            aria-required="true"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            {...register('phone')}
            className={inputClass(!!errors.phone)}
          />
          {errors.phone && (
            <p id="phone-error" role="alert" className="text-xs text-red-500">
              {t.errors[errors.phone.message ?? ''] ?? errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {t.email} <span aria-hidden="true" className="text-border">*</span>
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            aria-required="true"
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-500">
              {t.errors[errors.email.message ?? ''] ?? errors.email.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-medium text-foreground">
            {t.address} <span aria-hidden="true" className="text-border">*</span>
          </label>
          <input
            id="address"
            type="text"
            dir={isAr ? 'rtl' : 'ltr'}
            placeholder={t.addressPlaceholder}
            autoComplete="street-address"
            aria-required="true"
            aria-describedby={errors.address ? 'address-error' : undefined}
            {...register('address')}
            className={inputClass(!!errors.address)}
          />
          {errors.address && (
            <p id="address-error" role="alert" className="text-xs text-red-500">
              {t.errors[errors.address.message ?? ''] ?? errors.address.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-foreground">{t.notes}</label>
          <textarea
            id="notes"
            dir={isAr ? 'rtl' : 'ltr'}
            rows={3}
            placeholder={t.notesPlaceholder}
            maxLength={500}
            {...register('notes')}
            className={cn(inputClass(false), 'h-auto resize-none py-3')}
          />
        </div>

        {/* Privacy note */}
        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1L3 3.5V8c0 3 2.5 5.5 5 6.5C11.5 13.5 14 11 14 8V3.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          {t.privacy}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm border border-[var(--border-subtle)] rounded-sm hover:bg-[var(--color-sand-50)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {t.back}
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 bg-foreground text-white rounded-sm text-sm tracking-wide hover:bg-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
        >
          {t.continue}
        </button>
      </div>
    </form>
  )
}

