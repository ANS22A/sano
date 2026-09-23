'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordForEmail, updatePassword } from '@/app/actions/customerAccount.actions'
import { Mail, Lock, Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

function PasswordRecoveryFormContent({ type, locale }: { type: 'forgot' | 'reset', locale: string }) {
  const isAr = locale === 'ar'
  const tAuth = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(3)

  // Client-side validation state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{ password?: string; confirm?: string }>({})

  // For reset mode: check if there is an error from the callback
  const callbackError = searchParams.get('error')

  // Countdown + redirect after successful password update
  useEffect(() => {
    if (!passwordUpdated) return
    if (redirectCountdown <= 0) {
      router.push(`/${locale}/login`)
      return
    }
    const timer = setTimeout(() => setRedirectCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [passwordUpdated, redirectCountdown, router, locale])

  function validatePasswords(): boolean {
    const errors: { password?: string; confirm?: string } = {}

    if (password.length < 8) {
      errors.password = tAuth('passwordTooShort')
    }
    if (password !== confirmPassword) {
      errors.confirm = tAuth('passwordMismatch')
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (type === 'reset') {
      if (!validatePasswords()) return
    }

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let result
      if (type === 'forgot') {
        // Append locale so the server action can build locale-aware redirect URL
        formData.append('locale', locale)
        result = await resetPasswordForEmail(formData)
        if (result.success) {
          setMessage(tAuth('resetSent'))
        }
      } else {
        result = await updatePassword(formData)
        if (result.success) {
          setPasswordUpdated(true)
        }
      }

      if (result.error) {
        setError(result.error)
      }
    })
  }

  // Success state after password update
  if (passwordUpdated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-bg border-2 border-success-border mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className={`text-2xl font-bold text-foreground mb-3 ${isAr ? 'font-display' : 'font-display'}`}>
            {tAuth('passwordUpdated')}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {tAuth('redirectingToLogin')} ({redirectCountdown}s)
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {tAuth('backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">

        {/* Back Link */}
        <div className="mb-8">
          <Link href={`/${locale}/login`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
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

          {/* Show error from callback (invalid/expired recovery link) */}
          {callbackError && type === 'reset' && (
            <div className="mb-5 p-3 rounded-xl bg-error-bg border border-error-border text-sm text-error font-medium">
              {tAuth('invalidRecoveryLink')}
            </div>
          )}

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
              <>
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{tAuth('newPassword')}</label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, password: undefined }))
                      }}
                      className={`w-full ps-10 pe-4 py-3 rounded-xl border ${
                        validationErrors.password ? 'border-error' : 'border-subtle'
                      } bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-start`}
                      placeholder="••••••••"
                      dir="ltr"
                      minLength={8}
                    />
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-error mt-1">{validationErrors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? '٨ أحرف على الأقل' : 'At least 8 characters'}
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{tAuth('confirmPassword')}</label>
                  <div className="relative">
                    <ShieldCheck className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, confirm: undefined }))
                      }}
                      className={`w-full ps-10 pe-4 py-3 rounded-xl border ${
                        validationErrors.confirm ? 'border-error' : 'border-subtle'
                      } bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-start`}
                      placeholder="••••••••"
                      dir="ltr"
                      minLength={8}
                    />
                  </div>
                  {validationErrors.confirm && (
                    <p className="text-xs text-error mt-1">{validationErrors.confirm}</p>
                  )}
                </div>
              </>
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
              className="w-full py-3 px-4 rounded-xl bg-primary text-white text-sm font-bold tracking-wide
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

export function PasswordRecoveryForm(props: { type: 'forgot' | 'reset', locale: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PasswordRecoveryFormContent {...props} />
    </Suspense>
  )
}
