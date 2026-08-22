'use client'

import { useState, useTransition } from 'react'
import { signIn } from './actions'
import { adminT } from '@/lib/admin/translations'

export default function AdminLoginPage() {
  const t = adminT.en.auth
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ede0] to-[#ede0cc] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg">
            <span className="text-accent text-xl font-bold tracking-widest">SL</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t.login}</h1>
          <p className="text-sm text-[#7a6a57] mt-1">{t.loginSubtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="redirectTo" value="/admin" />

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ddd0c0] bg-surface text-foreground text-sm
                  placeholder:text-[#b8a898] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  transition-shadow"
                placeholder="admin@sanoluna.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                {t.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ddd0c0] bg-surface text-foreground text-sm
                  placeholder:text-[#b8a898] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium
                hover:bg-[#3a3128] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150 shadow-sm"
            >
              {isPending ? t.signingIn : t.signIn}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9a8a7a] mt-6">
          SANO LUNA Administration
        </p>
      </div>
    </div>
  )
}
