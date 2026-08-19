'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { ServiceFilters } from '@/data/types'

type SortValue = NonNullable<ServiceFilters['sort']>

interface SortDropdownProps {
  value: SortValue
  onChange: (sort: SortValue) => void
}

const SORT_OPTIONS: { value: SortValue; key: string }[] = [
  { value: 'recommended', key: 'sortRecommended' },
  { value: 'price_asc', key: 'sortPriceAsc' },
  { value: 'price_desc', key: 'sortPriceDesc' },
  { value: 'duration_asc', key: 'sortDuration' },
]

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations('services.catalog')

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <label
        htmlFor="services-sort"
        className="text-xs text-[var(--color-text-muted)] whitespace-nowrap hidden sm:block"
      >
        {t('sortLabel')}
      </label>
      <select
        id="services-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className={cn(
          'h-10 px-3 pe-7 rounded-sm text-sm',
          'border border-[var(--border-subtle)] bg-background text-foreground',
          'transition-colors duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
          'appearance-none',
          // Custom arrow via background
          'bg-no-repeat',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M2 4l4 4 4-4\' stroke=\'%239B9189\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")]',
          'bg-[position:calc(100%-10px)_center]'
        )}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.key as 'sortRecommended' | 'sortPriceAsc' | 'sortPriceDesc' | 'sortDuration')}
          </option>
        ))}
      </select>
    </div>
  )
}
