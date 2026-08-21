'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordForEmail, updatePassword } from '@/app/actions/customerAccount.actions'
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function PasswordRecoveryForm({ type, locale }: { type: 'forgot' | 'reset', locale: string }) {
  const isAr = locale === 'ar'
  const tAuth = useTranslations('auth')
  const router = useRouter()
  
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let result
      if (type === 'forgot') {
        result = await resetPasswordForEmail(formData)
        if (result.success) {
          setMessage(tAuth('resetSent'))
        }
      } else {
        result = await updatePassword(formData)
        if (result.success) {
          router.push(`/${locale}/login`)
        }
      }

      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#faf7f4] flex flex-col items-center justify-center p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href={`/${locale}/login`} className="inline-flex items-center gap-2 text-sm font-medium text-[#9a8a7a] hover:text-[#6F4E7C] transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {tAuth('backToLogin')}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2E1F38] text-[#D4AF37] font-serif text-2xl font-bold tracking-widest mb-6 shadow-xl">
            SL
          </div>
          <h1 className={`text-3xl font-bold text-[#2E1F38] ${isAr ? 'font-arabic' : 'font-serif'}`}>
            {type === 'forgot' ? tAuth('forgotPassword') : tAuth('resetPassword')}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E7DBEC]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {type === 'forgot' ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#2E1F38]">{tAuth('email')}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all text-start"
                    placeholder="customer@example.com"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#2E1F38]">{tAuth('newPassword')}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all text-start"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 font-medium">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-[#6F4E7C] text-white text-sm font-bold tracking-wide
                hover:bg-[#5a3d66] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
                transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {type === 'forgot' ? tAuth('sendResetLink') : tAuth('updatePassword')}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
