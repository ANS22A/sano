'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants } from '@/lib/motion/variants'

// ─────────────────────────────────────────────
// PAGE TRANSITION
//
// Subtle fade + slight vertical drift between pages.
// Uses framer-motion AnimatePresence keyed by pathname.
// Respects prefers-reduced-motion via CSS.
// Duration: 500ms in / 250ms out — not theatrical.
// ─────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col flex-1 min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
