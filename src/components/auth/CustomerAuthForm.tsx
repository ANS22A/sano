'use client'

import { useState, useTransition, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  customerSignIn,
  customerSignUp,
  verifyCustomerOtp,
  resendCustomerOtp,
} from '@/app/actions/customerAuth.actions'
import {
  Mail,
  Lock,
  Phone,
  User,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react'

// Translations dictionary for auth and OTP verification
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
    otpTitle: 'Verify your email',
    otpSubtitle: 'Enter the 6-digit verification code we sent to your email.',
    otpButton: 'Verify Code',
    otpVerifying: 'Verifying...',
    resendCountdown: 'Resend code in ({seconds}s)',
    resendButton: 'Resend Code',
    resending: 'Resending...',
    resendSuccess: 'A new verification code has been sent to your email.',
    changeEmail: 'Change email or try another account',
    verifiedSuccess: 'Your email has been verified successfully. You can now log in.',
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
    otpTitle: 'تحقق من بريدك الإلكتروني',
    otpSubtitle: 'أدخل رمز التحقق المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني.',
    otpButton: 'تأكيد الرمز',
    otpVerifying: 'جارٍ التحقق...',
    resendCountdown: 'إعادة الإرسال بعد ({seconds} ثانية)',
    resendButton: 'إعادة إرسال الرمز',
    resending: 'جارٍ الإرسال...',
    resendSuccess: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
    changeEmail: 'تغيير البريد الإلكتروني أو المحاولة بحساب آخر',
    verifiedSuccess: 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.',
  },
} as const

function CustomerAuthFormContent({
  type,
  locale,
}: {
  type: 'login' | 'register'
  locale: string
}) {
  const isAr = locale === 'ar'
  const t = tAuth[isAr ? 'ar' : 'en']
  const router = useRouter()
  const searchParams = useSearchParams()
  const isVerified = searchParams.get('verified') === 'true'

  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState('')
  const [requiresOtp, setRequiresOtp] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [isPending, startTransition] = useTransition()
  const [isResending, startResendTransition] = useTransition()

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (!requiresOtp || countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [requiresOtp, countdown])

  // Focus first OTP input when entering OTP view
  useEffect(() => {
    if (requiresOtp) {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [requiresOtp])

  function handleOtpChange(index: number, value: string) {
    // Only accept numeric input
    const cleanVal = value.replace(/\D/g, '')

    // Handle paste of full or multi-digit code
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split('')
      const nextDigits = [...otpDigits]
      pastedDigits.forEach((digit, i) => {
        if (i < 6) nextDigits[i] = digit
      })
      setOtpDigits(nextDigits)
      setError('')
      const focusIndex = Math.min(pastedDigits.length, 5)
      inputRefs.current[focusIndex]?.focus()
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = cleanVal
    setOtpDigits(nextDigits)
    setError('')

    // Move to next input if digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pastedData) return

    const digits = pastedData.slice(0, 6).split('')
    const nextDigits = ['', '', '', '', '', '']
    digits.forEach((digit, i) => {
      nextDigits[i] = digit
    })
    setOtpDigits(nextDigits)
    setError('')
    const focusIndex = Math.min(digits.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccessInfo('')
    const token = otpDigits.join('')

    if (token.length !== 6) {
      setError(
        isAr
          ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً.'
          : 'Please enter the complete 6-digit verification code.'
      )
      return
    }

    startTransition(async () => {
      const result = await verifyCustomerOtp({
        email: registeredEmail,
        token,
        locale,
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/${locale}/login?verified=true`)
      }
    })
  }

  function handleResend() {
    if (countdown > 0 || isResending) return
    setError('')
    setSuccessInfo('')

    startResendTransition(async () => {
      const result = await resendCustomerOtp({
        email: registeredEmail,
        locale,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessInfo(t.resendSuccess)
        setCountdown(60)
      }
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccessInfo('')
    const formData = new FormData(e.currentTarget)
    formData.append('locale', locale)
    const emailVal = formData.get('email')?.toString() ?? ''

    startTransition(async () => {
      if (type === 'login') {
        const result = await customerSignIn(formData)
        if (result.error) {
          setError(result.error)
        } else {
          router.push(`/${locale}`)
        }
      } else {
        const result = await customerSignUp(formData)
        if (result.error) {
          setError(result.error)
        } else if (result.requiresVerification) {
          setRegisteredEmail(emailVal)
          setRequiresOtp(true)
          setCountdown(60)
        } else {
          router.push(`/${locale}`)
        }
      }
    })
  }

  // ─── 6-DIGIT OTP VERIFICATION SCREEN ───────────────────────────────────────
  if (requiresOtp) {
    return (
      <div
        className="min-h-screen bg-[#faf7f4] flex flex-col items-center justify-center p-4 sm:p-8"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2E1F38] text-[#D4AF37] font-serif text-2xl font-bold tracking-widest mb-4 shadow-xl">
              SL
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-bold text-[#2E1F38] ${
                isAr ? 'font-arabic' : 'font-serif'
              }`}
            >
              {t.otpTitle}
            </h1>
            <p className="text-[#7a6a57] mt-2 text-sm max-w-xs mx-auto leading-relaxed">
              {t.otpSubtitle}
            </p>
            {registeredEmail && (
              <p className="text-xs font-semibold text-[#2E1F38] mt-1 bg-white/70 py-1 px-3 rounded-full inline-block border border-[#E7DBEC] dir-ltr" dir="ltr">
                {registeredEmail}
              </p>
            )}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E7DBEC]">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6-Digit OTP Input Row */}
              <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border border-[#E7DBEC] bg-[#faf7f4] text-[#2E1F38] focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-[#c9a96e] transition-all shadow-inner"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Status alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium text-center">
                  {error}
                </div>
              )}

              {successInfo && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successInfo}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isPending || otpDigits.join('').length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2a2118] text-white text-sm font-bold tracking-wide
                  hover:bg-[#3a3128] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.otpVerifying}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{t.otpButton}</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 pt-4 border-t border-[#E7DBEC] flex items-center justify-between text-xs sm:text-sm text-[#7a6a57]">
              <span>
                {countdown > 0
                  ? t.resendCountdown.replace('{seconds}', String(countdown))
                  : ''}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="font-semibold text-[#6F4E7C] hover:text-[#5a3d66] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.resending}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.resendButton}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Back/Change Email Option */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setRequiresOtp(false)
                setError('')
                setSuccessInfo('')
              }}
              className="text-xs text-[#9a8a7a] hover:text-[#6F4E7C] underline transition-colors"
            >
              {t.changeEmail}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── LOGIN / REGISTER STANDARD FORM ────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#faf7f4] flex flex-col items-center justify-center p-4 sm:p-8"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9a8a7a] hover:text-[#6F4E7C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t.back}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2E1F38] text-[#D4AF37] font-serif text-2xl font-bold tracking-widest mb-6 shadow-xl">
            SL
          </div>
          <h1
            className={`text-3xl font-bold text-[#2E1F38] ${
              isAr ? 'font-arabic' : 'font-serif'
            }`}
          >
            {type === 'login' ? t.loginTitle : t.registerTitle}
          </h1>
          <p className="text-[#7a6a57] mt-2 text-sm">
            {type === 'login' ? t.loginSubtitle : t.registerSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E7DBEC]">
          {isVerified && type === 'login' && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.verifiedSuccess}</span>
            </div>
          )}

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
                  <Link
                    href={`/${locale}/forgot-password`}
                    className="text-xs font-medium text-[#6F4E7C] hover:underline"
                  >
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
              {type === 'login'
                ? isPending
                  ? t.signingIn
                  : t.signIn
                : isPending
                ? t.signingUp
                : t.signUp}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          {type === 'login' ? (
            <p className="text-sm text-[#7a6a57]">
              {t.noAccount}{' '}
              <Link
                href={`/${locale}/register`}
                className="font-semibold text-[#6F4E7C] hover:underline"
              >
                {t.signUp}
              </Link>
            </p>
          ) : (
            <p className="text-sm text-[#7a6a57]">
              {t.hasAccount}{' '}
              <Link
                href={`/${locale}/login`}
                className="font-semibold text-[#6F4E7C] hover:underline"
              >
                {t.signIn}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function CustomerAuthForm(props: { type: 'login' | 'register'; locale: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f4] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6F4E7C]" />
        </div>
      }
    >
      <CustomerAuthFormContent {...props} />
    </Suspense>
  )
}
