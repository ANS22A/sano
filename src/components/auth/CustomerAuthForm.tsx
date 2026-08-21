'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { customerSignIn, customerSignUp } from '@/app/actions/customerAuth.actions'
import { Mail, Lock, Phone, User, Loader2, ArrowLeft } from 'lucide-react'

// Simple translations dictionary for this component
const tAuth = {
  en: {
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to manage your appointments.',
    registerTitle: 'Create Account',
    registerSubtitle: 'Join SANO LUNA for luxury home spa services.',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    password: 'Password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    signUp: 'Create Account',
    signingUp: 'Creating account...',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    back: 'Back to Home',
  },
  ar: {
    loginTitle: 'أهلاً بك مجدداً',
    loginSubtitle: 'سجلي دخولك لإدارة حجوزاتك.',
    registerTitle: 'إنشاء حساب',
    registerSubtitle: 'انضمي إلى سانو لونا لخدمات السبا المنزلية الفاخرة.',
    fullName: 'الاسم الكامل',
    phone: 'رقم الجوال',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signingIn: 'جارٍ تسجيل الدخول...',
    signUp: 'إنشاء حساب',
    signingUp: 'جارٍ الإنشاء...',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    back: 'العودة للرئيسية',
  }
} as const

export function CustomerAuthForm({ type, locale }: { type: 'login' | 'register', locale: string }) {
  const isAr = locale === 'ar'
  const t = tAuth[isAr ? 'ar' : 'en']
  const router = useRouter()
  
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let result
      if (type === 'login') {
        result = await customerSignIn(formData)
      } else {
        result = await customerSignUp(formData)
      }

      if (result.error) {
        setError(result.error)
      } else {
        // Redirect on success (you can route to account dashboard later)
        router.push(`/${locale}`)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#faf7f4] flex flex-col items-center justify-center p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#9a8a7a] hover:text-[#6F4E7C] transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t.back}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2E1F38] text-[#D4AF37] font-serif text-2xl font-bold tracking-widest mb-6 shadow-xl">
            SL
          </div>
          <h1 className={`text-3xl font-bold text-[#2E1F38] ${isAr ? 'font-arabic' : 'font-serif'}`}>
            {type === 'login' ? t.loginTitle : t.registerTitle}
          </h1>
          <p className="text-[#7a6a57] mt-2 text-sm">
            {type === 'login' ? t.loginSubtitle : t.registerSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E7DBEC]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {type === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#2E1F38]">{t.fullName}</label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
                    <input
                      name="fullName"
                      type="text"
                      required
                      className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all text-start"
                      placeholder={isAr ? 'الاسم' : 'Name'}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#2E1F38]">{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A98FB8]" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="w-full ps-10 pe-4 py-3 rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E7C] focus:border-transparent transition-all text-start"
                      placeholder="05X XXX XXXX"
                      dir="ltr"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#2E1F38]">{t.email}</label>
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#2E1F38]">{t.password}</label>
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
              {type === 'login' && (
                <div className="flex justify-end mt-2">
                  <Link href={`/${locale}/forgot-password`} className="text-xs font-medium text-[#6F4E7C] hover:underline">
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </Link>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                {error}
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
              {type === 'login' ? (isPending ? t.signingIn : t.signIn) : (isPending ? t.signingUp : t.signUp)}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          {type === 'login' ? (
            <p className="text-sm text-[#7a6a57]">
              {t.noAccount}{' '}
              <Link href={`/${locale}/register`} className="font-semibold text-[#6F4E7C] hover:underline">
                {t.signUp}
              </Link>
            </p>
          ) : (
            <p className="text-sm text-[#7a6a57]">
              {t.hasAccount}{' '}
              <Link href={`/${locale}/login`} className="font-semibold text-[#6F4E7C] hover:underline">
                {t.signIn}
              </Link>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
