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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href={`/${locale}/login`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {tAuth('backToLogin')}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-accent font-display text-2xl font-bold tracking-widest mb-6 shadow-xl">
            SL
          </div>
          <h1 className={`text-3xl font-bold text-foreground ${isAr ? 'font-display' : 'font-display'}`}>
            {type === 'forgot' ? tAuth('forgotPassword') : tAuth('resetPassword')}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-subtle">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {type === 'forgot' ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{tAuth('email')}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-subtle bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-start"
                    placeholder="customer@example.com"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{tAuth('newPassword')}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-subtle bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-start"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-error-bg border border-error-border text-sm text-error font-medium">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-xl bg-success-bg border border-success-border text-sm text-success font-medium">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-secondary text-white text-sm font-bold tracking-wide
                hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
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
