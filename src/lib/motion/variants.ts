/**
 * SANO LUNA — Framer Motion Variant Library
 *
 * Unified motion language: Calm, Luxury, Continuous.
 * All values derived from design-tokens.ts motion system.
 *
 * Usage:
 *   import { fadeUp, stagger, imageReveal } from '@/lib/motion/variants'
 *   <motion.div variants={fadeUp} initial="hidden" whileInView="visible" />
 */

import type { Variants, Transition } from 'framer-motion'

// ─────────────────────────────────────────────
// SHARED TRANSITIONS
// ─────────────────────────────────────────────

export const transitionLuxury: Transition = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94],
}

export const transitionFast: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
}

export const transitionReveal: Transition = {
  duration: 0.6,
  ease: [0, 0, 0.2, 1],
}

// ─────────────────────────────────────────────
// FADE UP — Primary reveal (most common)
// ─────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionReveal,
  },
}

// ─────────────────────────────────────────────
// FADE IN — Simple opacity reveal
// ─────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionReveal,
  },
}

// ─────────────────────────────────────────────
// FADE LEFT — From start direction (RTL-agnostic)
// ─────────────────────────────────────────────

export const fadeFromStart: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionReveal,
  },
}

export const fadeFromEnd: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionReveal,
  },
}

// ─────────────────────────────────────────────
// SCALE REVEAL — Subtle grow in
// ─────────────────────────────────────────────

export const scaleReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// ─────────────────────────────────────────────
// IMAGE REVEAL — Clip path wipe
// ─────────────────────────────────────────────

export const imageReveal: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)',
  },
  visible: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: {
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// ─────────────────────────────────────────────
// TEXT REVEAL — Line by line (for headings)
// ─────────────────────────────────────────────

export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
  },
  visible: {
    opacity: 1,
    y: '0%',
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// ─────────────────────────────────────────────
// STAGGER CONTAINER — Parent that staggers children
// ─────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

// ─────────────────────────────────────────────
// STAGGER ITEM — Used as children of stagger containers
// ─────────────────────────────────────────────

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionReveal,
  },
}

// ─────────────────────────────────────────────
// DIVIDER LINE — Width reveal
// ─────────────────────────────────────────────

export const lineReveal: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3,
    },
  },
}

// ─────────────────────────────────────────────
// HOVER — Micro-interactions for cards/buttons
// ─────────────────────────────────────────────

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.99 },
  transition: transitionFast,
}

export const hoverLift = {
  whileHover: { y: -3 },
  whileTap:   { y: 0 },
  transition: transitionFast,
}

// ─────────────────────────────────────────────
// PAGE TRANSITION
// ─────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// ─────────────────────────────────────────────
// MODAL ANIMATION
// ─────────────────────────────────────────────

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// ─────────────────────────────────────────────
// MOBILE DRAWER
// ─────────────────────────────────────────────

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
}

export const drawerVariantsRTL: Variants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    x: '-100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
}
