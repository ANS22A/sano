'use client'

import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { desktopNavigation, desktopMoreLinks } from '@/config/site.config'
import type { NavItem } from '@/types/ui.types'
import { useState, useRef, useEffect } from 'react'

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
// MORE DROPDOWN
// ─────────────────────────────────────────────

function MoreDropdown({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAnyActive = desktopMoreLinks.some(item => pathname.startsWith(item.href))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          'relative group text-nav py-1 px-1 flex items-center gap-1',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
          variant === 'light'
            ? isAnyActive || isOpen
              ? 'text-white'
              : 'text-white/70 hover:text-white'
            : isAnyActive || isOpen
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span>{t('more')}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <motion.span
          className={cn(
            'absolute -bottom-0.5 start-0 end-0 h-px',
            variant === 'light' ? 'bg-white/60' : 'bg-accent'
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isAnyActive ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'var(--tw-origin-start, 0%)' }}
        />
        {!isAnyActive && (
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
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-4 w-48 rounded-md bg-white shadow-luxury border border-border-subtle py-2 z-50',
            'rtl:right-0 ltr:left-0'
          )}
          role="menu"
        >
          {desktopMoreLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href as '/'}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className={cn(
                'block w-full text-start px-4 py-2.5 text-sm transition-colors duration-150',
                pathname.startsWith(item.href)
                  ? 'text-foreground bg-muted font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
              )}
            >
              {t(item.key as 'home')}
            </Link>
          ))}
        </div>
      )}
    </div>
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
      {desktopNavigation.map((item) => (
        <NavLink key={item.key} item={item} variant={variant} />
      ))}
      <MoreDropdown variant={variant} />
    </nav>
  )
}
