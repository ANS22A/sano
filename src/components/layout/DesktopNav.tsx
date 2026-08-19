'use client'

import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { primaryNavigation } from '@/config/site.config'
import type { NavItem } from '@/types/ui.types'

// ─────────────────────────────────────────────
// DESKTOP NAV LINK
// ─────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem
  variant?: 'light' | 'dark'
}

function NavLink({ item, variant = 'dark' }: NavLinkProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  // Active check: exact match for home, startsWith for others
  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href as '/'}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative group text-nav py-1 px-1',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
        // Color based on variant and active state
        variant === 'light'
          ? isActive
            ? 'text-white'
            : 'text-white/70 hover:text-white'
          : isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <span className="relative">
        {t(item.key as 'home')}

        {/* Underline reveal — brand signature */}
        <motion.span
          className={cn(
            'absolute -bottom-0.5 start-0 end-0 h-px',
            variant === 'light' ? 'bg-white/60' : 'bg-accent'
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'var(--tw-origin-start, 0%)' }}
        />
        {/* Hover underline (only when not active) */}
        {!isActive && (
          <span
            className={cn(
              'absolute -bottom-0.5 start-0 end-0 h-px',
              'origin-start scale-x-0 group-hover:scale-x-100',
              'transition-transform duration-200 ease-smooth',
              variant === 'light' ? 'bg-white/40' : 'bg-border-strong'
            )}
            aria-hidden="true"
          />
        )}
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────────
// DESKTOP NAV — Full navigation bar links
// ─────────────────────────────────────────────

interface DesktopNavProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function DesktopNav({ variant = 'dark', className }: DesktopNavProps) {
  const t = useTranslations('header')

  return (
    <nav
      aria-label={t('navLabel')}
      className={cn('hidden lg:flex items-center gap-6 xl:gap-8', className)}
    >
      {primaryNavigation.map((item) => (
        <NavLink key={item.key} item={item} variant={variant} />
      ))}
    </nav>
  )
}
