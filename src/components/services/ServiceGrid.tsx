'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ServiceCard } from './ServiceCard'
import { CategoryFilter } from './CategoryFilter'
import { ServiceSearch } from './ServiceSearch'
import { SortDropdown } from './SortDropdown'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils/cn'
import type { Service, ServiceCategory, ServiceFilters } from '@/data/types'

interface ServiceGridProps {
  services: Service[]
  categories: ServiceCategory[]
}

export function ServiceGrid({ services, categories }: ServiceGridProps) {
  const t = useTranslations('services.catalog')
  const locale = useLocale()
  const isAr = locale === 'ar'

  // Filter state
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<NonNullable<ServiceFilters['sort']>>('recommended')

  // Build category map for display
  const categoryMap = useMemo(() => {
    const map = new Map<string, ServiceCategory>()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  // Filtered & sorted services (client-side for instant UX)
  const filtered = useMemo(() => {
    let result = [...services]

    // Category filter
    if (activeCategory) {
      const cat = categories.find((c) => c.slug === activeCategory)
      if (cat) result = result.filter((s) => s.category_id === cat.id)
    }

    // Search
    const q = search.toLowerCase().trim()
    if (q) {
      result = result.filter((s) => {
        const fields = [s.name_ar, s.name_en, s.short_description_ar, s.short_description_en, ...s.tags]
        const cat = categoryMap.get(s.category_id)
        if (cat) fields.push(cat.name_ar, cat.name_en)
        return fields.some((f) => f.toLowerCase().includes(q))
      })
    }

    // Sort
    switch (sort) {
      case 'price_asc':   result.sort((a, b) => a.price_sar - b.price_sar); break
      case 'price_desc':  result.sort((a, b) => b.price_sar - a.price_sar); break
      case 'duration_asc':result.sort((a, b) => a.duration_minutes - b.duration_minutes); break
      default:            result.sort((a, b) => a.sort_order - b.sort_order); break
    }

    return result
  }, [services, activeCategory, search, sort, categories, categoryMap])

  const handleReset = useCallback(() => {
    setSearch('')
    setActiveCategory(null)
    setSort('recommended')
  }, [])

  const hasActiveFilters = search !== '' || activeCategory !== null || sort !== 'recommended'

  return (
    <div className="space-y-8">
      {/* Controls bar */}
      <div className={cn(
        'flex flex-col gap-4',
        'lg:flex-row lg:items-start lg:justify-between'
      )}>
        {/* Category tabs */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        {/* Search + Sort */}
        <div className="flex gap-3 flex-shrink-0 w-full lg:w-auto">
          <div className="flex-1 lg:w-64">
            <ServiceSearch value={search} onChange={setSearch} />
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Results count + reset */}
      <div className={cn(
        'flex items-center justify-between',
        'text-xs text-[var(--color-text-muted)]'
      )}>
        <span>
          {t('resultsCount', { count: filtered.length })}
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {t('resetFilters')}
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div
          className={cn(
            'grid gap-6',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
          role="list"
          aria-label={isAr ? 'قائمة الخدمات' : 'Services list'}
        >
          {filtered.map((service, i) => (
            <div key={service.id} role="listitem">
              <ServiceCard
                service={service}
                category={categoryMap.get(service.category_id)}
                index={i}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState onReset={hasActiveFilters ? handleReset : undefined} />
      )}
    </div>
  )
}
