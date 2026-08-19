'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import type { ServiceCategory } from '@/data/types'

interface ServiceBreadcrumbProps {
  category: Pick<ServiceCategory, 'slug' | 'name_ar' | 'name_en'>
  serviceName: string
}

export function ServiceBreadcrumb({ category, serviceName }: ServiceBreadcrumbProps) {
  const t = useTranslations('services.detail')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const catName = isAr ? category.name_ar : category.name_en

  return (
    <nav
      aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}
      className="py-4 border-b border-[var(--border-subtle)]"
    >
      <div className="container-sl">
        <ol
          className={cn(
            'flex items-center gap-2 text-xs text-[var(--color-text-muted)]',
            'flex-wrap'
          )}
        >
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors duration-150"
            >
              {t('breadcrumbHome')}
            </Link>
          </li>
          <li aria-hidden="true" className="text-[var(--border)]">
            {isAr ? '←' : '→'}
          </li>
          <li>
            <Link
              href="/services"
              className="hover:text-foreground transition-colors duration-150"
            >
              {t('breadcrumbServices')}
            </Link>
          </li>
          <li aria-hidden="true" className="text-[var(--border)]">
            {isAr ? '←' : '→'}
          </li>
          <li>
            <Link
              href={`/services?category=${category.slug}`}
              className="hover:text-foreground transition-colors duration-150"
            >
              {catName}
            </Link>
          </li>
          <li aria-hidden="true" className="text-[var(--border)]">
            {isAr ? '←' : '→'}
          </li>
          <li
            className="text-foreground font-medium truncate max-w-[160px] sm:max-w-none"
            aria-current="page"
          >
            {serviceName}
          </li>
        </ol>
      </div>
    </nav>
  )
}
