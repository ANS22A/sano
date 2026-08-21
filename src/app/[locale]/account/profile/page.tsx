'use client'

import { useState, useTransition, useEffect } from 'react'
import { getCustomerProfile, updateCustomerProfile } from '@/app/actions/customerAccount.actions'
import { User, Mail, Phone, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

export default function AccountProfilePage() {
  const t = useTranslations('account')
  const locale = useLocale()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAr = locale === 'ar'
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data } = await getCustomerProfile()
      if (data) {
        setProfile(data)
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateCustomerProfile(formData)
      if (result.success) {
        setMessage(t('profileUpdated'))
      } else if (result.error) {
        setError(result.error)
      }
    })
  }

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#6F4E7C]" /></div>
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E7DBEC]">
      <h1 className="text-2xl font-bold text-[#2E1F38] mb-8 font-serif">{t('profile')}</h1>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#2E1F38]">Full Name / الاسم الكامل</label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
            <input
              name="fullName"
              type="text"
              required
              defaultValue={profile?.full_name || ''}
              className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#2E1F38]">Email / البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
            <input
              name="email"
              type="email"
              required
              defaultValue={profile?.email || ''}
              className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all text-start"
              dir="ltr"
            />
          </div>
          <p className="text-xs text-[#A98FB8] mt-1">Changing your email requires verification.</p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#2E1F38]">Phone / رقم الجوال</label>
          <div className="relative">
            <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
            <input
              name="phone"
              type="text"
              required
              defaultValue={profile?.phone || ''}
              className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all text-start"
              dir="ltr"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#6F4E7C] text-white text-sm font-bold tracking-wide
            hover:bg-[#5a3d66] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
            transition-all duration-200 shadow-md flex items-center justify-center gap-2 mt-8"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('saveChanges')}
        </button>
      </form>
    </div>
  )
}
