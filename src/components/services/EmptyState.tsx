'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  onReset?: () => void
}

export function EmptyState({ onReset }: EmptyStateProps) {
  const t = useTranslations('services.catalog')

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      'py-20 px-6 col-span-full'
    )}>
      {/* Decorative */}
      <div
        className="w-16 h-16 rounded-full bg-[var(--color-sand-100)] flex items-center justify-center mb-6"
        aria-hidden="true"
      >
        <span className="text-2xl text-[var(--color-sand-500)]">◌</span>
      </div>

      <h3 className="heading-sl-sm mb-2">{t('noResults')}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-xs">
        {t('noResultsHint')}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className={cn(
            'btn btn-md btn-secondary',
            'inline-flex items-center gap-2'
          )}
        >
          {t('resetFilters')}
        </button>
      )}
    </div>
  )
}

// ─── Skeleton card — for loading states ───────

export function ServiceSkeleton() {
  return (
    <div className="rounded-sm border border-[var(--border-subtle)] bg-background overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-52 bg-[var(--color-sand-100)]" />
      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="h-3 bg-[var(--color-sand-100)] rounded w-1/4" />
        <div className="h-5 bg-[var(--color-sand-100)] rounded w-3/4" />
        <div className="h-3 bg-[var(--color-sand-100)] rounded w-full" />
        <div className="h-3 bg-[var(--color-sand-100)] rounded w-5/6" />
        <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between">
          <div className="h-4 bg-[var(--color-sand-100)] rounded w-1/3" />
          <div className="h-4 bg-[var(--color-sand-100)] rounded w-1/5" />
        </div>
      </div>
    </div>
  )
}
