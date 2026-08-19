'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
// LANGUAGE SWITCHER
//
// Preserves the current route when switching locale.
// EN → AR maintains /en/services → /ar/services
// Keyboard accessible, aria-labelled.
// ─────────────────────────────────────────────

interface LanguageSwitcherProps {
  variant?: 'header' | 'mobile'
  className?: string
}

export function LanguageSwitcher({
  variant = 'header',
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations('aria')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const targetLocale = locale === 'ar' ? 'en' : 'ar'
  const label = locale === 'ar' ? 'English' : 'عربي'
  const ariaLabel =
    locale === 'ar' ? t('switchToEnglish') : t('switchToArabic')

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: targetLocale })
    })
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleSwitch}
        disabled={isPending}
        aria-label={ariaLabel}
        className={cn(
          'flex items-center gap-3 w-full py-3',
          'text-body-sm font-medium text-muted-foreground',
          'hover:text-foreground transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-wait',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
          className
        )}
      >
        {/* Globe icon inline SVG — avoids extra import */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={ariaLabel}
      className={cn(
        'text-nav text-muted-foreground',
        'hover:text-foreground transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-wait',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
        'px-2 py-1',
        className
      )}
    >
      {label}
    </button>
  )
}
