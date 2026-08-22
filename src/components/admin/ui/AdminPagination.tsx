'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  total: number
  perPage?: number
  dir?: 'ltr' | 'rtl'
}

export function AdminPagination({ total, perPage = 25, dir = 'ltr' }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const totalPages = Math.ceil(total / perPage)

  if (totalPages <= 1) return null

  function pageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    return `${pathname}?${params.toString()}`
  }

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight

  return (
    <div className={`flex items-center gap-2 justify-end mt-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
      <span className="text-xs text-muted-foreground">
        Page {page} / {totalPages}
      </span>

      <Link
        href={pageHref(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          'p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-surface-muted transition-colors',
          page <= 1 && 'pointer-events-none opacity-40'
        )}
        aria-label="Previous page"
      >
        <PrevIcon className="w-4 h-4" />
      </Link>

      <Link
        href={pageHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          'p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-surface-muted transition-colors',
          page >= totalPages && 'pointer-events-none opacity-40'
        )}
        aria-label="Next page"
      >
        <NextIcon className="w-4 h-4" />
      </Link>
    </div>
  )
}
