'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface ServiceSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ServiceSearch({ value, onChange }: ServiceSearchProps) {
  const t = useTranslations('services.catalog')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (newVal: string) => {
      setDraft(newVal)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onChange(newVal), 300)
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setDraft('')
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  // Reflect external reset (e.g. "reset filters" button) without effects
  // draft is a local mirror; when value is '', clear immediately
  const displayValue = value === '' && draft !== '' ? '' : draft

  return (
    <div className="relative">
      {/* Search icon */}
      <div
        className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label={isAr ? 'البحث في الخدمات' : 'Search services'}
        placeholder={t('searchPlaceholder')}
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          'w-full h-10 rounded-sm border border-[var(--border-subtle)]',
          'bg-background text-foreground text-sm',
          'placeholder:text-[var(--color-text-muted)]',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
          'focus:border-foreground ps-9 pe-4'
        )}
      />

      {/* Clear button */}
      {displayValue && (
        <button
          onClick={handleClear}
          aria-label={isAr ? 'مسح البحث' : 'Clear search'}
          className={cn(
            'absolute inset-y-0 end-0 flex items-center px-3',
            'text-[var(--color-text-muted)] hover:text-foreground transition-colors'
          )}
        >
          ✕
        </button>
      )}
    </div>
  )
}

