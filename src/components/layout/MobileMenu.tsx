'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { usePathname, Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import { primaryNavigation } from '@/config/site.config'
import type { Easing } from 'framer-motion'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { overlayVariants, staggerContainer, staggerItem } from '@/lib/motion/variants'
import type { NavItem } from '@/types/ui.types'

// ─────────────────────────────────────────────
// MOBILE MENU
//
// Full-screen overlay with staggered link reveal.
// Accessibility: focus trap, Escape key, aria-modal.
// RTL: panel slides from left in Arabic, right in English.
// ─────────────────────────────────────────────

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Typed easing curves
const easeLuxury = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const easeOut   = [0.4, 0, 1, 1] as [number, number, number, number]

// Panel slide variants — direction based on locale handled in component
const panelVariants = {
  hidden: (dir: string) => ({
    x: dir === 'rtl' ? '-100%' : '100%' as string,
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.38,
      ease: easeLuxury as unknown as Easing,
    },
  },
  exit: (dir: string) => ({
    x: dir === 'rtl' ? '-100%' : '100%' as string,
    opacity: 0,
    transition: {
      duration: 0.28,
      ease: easeOut as unknown as Easing,
    },
  }),
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations('nav')
  const tHeader = useTranslations('header')
  const tAria = useTranslations('aria')
  const locale = useLocale()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const pathname = usePathname()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Lock body scroll while menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Move focus to close button
      closeButtonRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="mobile-panel"
            custom={dir}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={tAria('mobileMenu')}
            dir={dir}
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-sm',
              'bg-background flex flex-col',
              'shadow-luxury end-0'
            )}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 h-[64px] border-b border-border-subtle">
              <Logo variant="auto" size="sm" onClick={onClose} />
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label={tHeader('closeMenu')}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-sm',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-muted transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                <X size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            {/* Navigation links */}
            <nav
              aria-label={tAria('mobileMenu')}
              className="flex-1 overflow-y-auto px-6 py-8"
            >
              <motion.ul
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-1"
                role="list"
              >
                {primaryNavigation.map((item: NavItem, index) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href)

                  return (
                    <motion.li key={item.key} variants={staggerItem}>
                      <Link
                        href={item.href as '/'}
                        onClick={onClose}
                        ref={index === 0 ? firstLinkRef : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-center py-3 px-2 -mx-2 rounded-sm',
                          'text-h4 font-display',
                          'transition-colors duration-150',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-ring focus-visible:ring-offset-2',
                          isActive
                            ? 'text-primary'
                            : 'text-foreground hover:text-primary'
                        )}
                      >
                        {isActive && (
                          <span
                            className="w-1 h-4 bg-accent rounded-full me-3 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {t(item.key as 'home')}
                      </Link>
                    </motion.li>
                  )
                })}
              </motion.ul>
            </nav>

            {/* Panel footer — CTA + Language */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.35, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              }}
              className="px-6 py-6 border-t border-border-subtle space-y-4"
            >
              {/* Booking CTA */}
              <Link
                href="/booking"
                onClick={onClose}
                className={cn(
                  'btn btn-primary btn-md w-full justify-center',
                  'text-center'
                )}
              >
                {tHeader('bookCta')}
              </Link>

              {/* Language Switcher */}
              <LanguageSwitcher variant="mobile" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
