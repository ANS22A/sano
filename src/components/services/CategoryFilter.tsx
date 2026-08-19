'use client'

import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { ServiceCategory } from '@/data/types'

interface CategoryFilterProps {
  categories: ServiceCategory[]
  activeCategory: string | null
  onChange: (slug: string | null) => void
}

export function CategoryFilter({ categories, activeCategory, onChange }: CategoryFilterProps) {
  const t = useTranslations('services.catalog')
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <nav
      aria-label={isAr ? 'فلتر الفئات' : 'Category filter'}
      className="w-full overflow-x-auto"
    >
      <div className="flex items-center gap-2 pb-1 min-w-max">
        {/* All button */}
        <button
          onClick={() => onChange(null)}
          aria-pressed={activeCategory === null}
          className={cn(
            'inline-flex items-center px-4 py-2 rounded-sm text-sm transition-all duration-200',
            'border whitespace-nowrap',
            activeCategory === null
              ? 'bg-foreground text-background border-foreground'
              : 'bg-background text-foreground border-[var(--border-subtle)] hover:border-[var(--color-sand-400)]'
          )}
        >
          {t('allCategories')}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onChange(cat.slug)}
            aria-pressed={activeCategory === cat.slug}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm transition-all duration-200',
              'border whitespace-nowrap',
              activeCategory === cat.slug
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-[var(--border-subtle)] hover:border-[var(--color-sand-400)]'
            )}
          >
            <span aria-hidden="true" className="text-xs">{cat.icon}</span>
            {isAr ? cat.name_ar : cat.name_en}
          </button>
        ))}
      </div>
    </nav>
  )
}
