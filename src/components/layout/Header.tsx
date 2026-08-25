'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { Logo } from './Logo'
import { DesktopNav } from './DesktopNav'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileMenu } from './MobileMenu'
import { Link, usePathname } from '@/i18n/navigation'

// ─────────────────────────────────────────────
// HEADER COMPONENT
//
// Two-state design:
//   State A (top on home): transparent, white text — integrates with hero
//   State B (scrolled or inner pages): surface background, dark text, subtle border
//
// Transition: smooth CSS transition, no JS jank, no scroll-jacking.
// RTL/LTR: inherits from html[dir]; flex order is direction-aware.
// ─────────────────────────────────────────────

const SCROLL_THRESHOLD = 48 // px before state changes

export function Header({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const t = useTranslations('header')
  const tAria = useTranslations('aria')
  const pathname = usePathname()
  const isHomePage = pathname === '/' || pathname === ''
  
  // Lazy initialiser — reads scroll position on mount, no effect needed
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD
  )
  const [menuOpen, setMenuOpen] = useState(false)

  // Passive scroll listener
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  // Passive scroll listener — no performance cost
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const isSolid = isScrolled || !isHomePage
  const navVariant = isSolid ? 'dark' : 'light'
  const logoVariant = isSolid ? 'auto' : 'light'

  return (
    <>
      <header
        className={cn(
          // Layout — fixed, full width
          'fixed top-0 inset-x-0 z-40',
          'h-[64px] lg:h-[80px]',
          // CSS transition — smooth state change
          'transition-all duration-300 ease-in-out',
          // State A — transparent overlay on homepage
          !isSolid && [
            'bg-transparent',
            'border-b border-transparent',
          ],
          // State B — scrolled or non-home with surface background
          isSolid && [
            'bg-[rgba(255,252,254,0.97)]',
            'border-b border-[var(--border-subtle)]',
            'shadow-subtle',
            '[backdrop-filter:blur(12px)]',
          ]
        )}
        role="banner"
      >
        <div className="h-full container-sl flex items-center justify-between gap-4 lg:gap-8">

          {/* ── Logo ── */}
          <Logo variant={logoVariant} size="md" />

          {/* ── Desktop Nav ── */}
          <DesktopNav variant={navVariant} className="flex-1 justify-center" />

          {/* ── Desktop Right Actions ── */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
            <LanguageSwitcher
              variant="header"
              className={!isSolid ? 'text-white/80 hover:text-white' : undefined}
            />

            {/* Divider */}
            <span
              className={cn(
                'w-px h-4 transition-colors duration-300',
                isSolid ? 'bg-[var(--border)]' : 'bg-white/25'
              )}
              aria-hidden="true"
            />

            {/* Account CTA */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className={cn(
                'text-sm font-medium transition-colors',
                isSolid ? 'text-foreground hover:text-accent' : 'text-white/90 hover:text-white'
              )}
            >
              {isAuthenticated ? t('account') : t('signIn')}
            </Link>

            {/* Booking CTA */}
            <Link
              href="/booking"
              className={cn(
                'btn btn-md transition-colors duration-200',
                isSolid
                  ? 'btn-primary'
                  : 'border border-white/50 text-white hover:bg-white/10 hover:border-white/80'
              )}
            >
              {t('bookCta')}
            </Link>
          </div>

          {/* ── Mobile Right Actions ── */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile booking shortcut */}
            <Link
              href="/booking"
              aria-label={t('bookCta')}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-sm',
                'transition-colors duration-200',
                isSolid
                  ? 'text-foreground hover:bg-muted'
                  : 'text-white/80 hover:text-white'
              )}
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={openMenu}
              aria-label={tAria('menuOpen')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-sm',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                isSolid
                  ? 'text-foreground hover:bg-muted'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={menuOpen} onClose={closeMenu} isAuthenticated={isAuthenticated} />
    </>
  )
}

// ─────────────────────────────────────────────
// HAMBURGER ICON — brand signature 3-line
// Middle line intentionally shorter
// ─────────────────────────────────────────────

function HamburgerIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20"
      fill="none" aria-hidden="true"
    >
      <line x1="2" y1="5"  x2="18" y2="5"  stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}
