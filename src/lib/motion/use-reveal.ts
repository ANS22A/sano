'use client'

/**
 * SANO LUNA — useReveal Hook
 *
 * Scroll-triggered reveal animation using Framer Motion's useInView.
 * Respects prefers-reduced-motion.
 * Returns controls to animate children when they enter the viewport.
 *
 * @example
 * const { ref, controls } = useReveal()
 * <motion.div ref={ref} initial="hidden" animate={controls} variants={fadeUp}>
 *   ...
 * </motion.div>
 */

import { useEffect, useRef } from 'react'
import { useAnimation, useInView } from 'framer-motion'

interface UseRevealOptions {
  /** Fraction of element visible before trigger (0-1). Default: 0.15 */
  threshold?: number
  /** Delay before animation starts in seconds. Default: 0 */
  delay?: number
  /** Only trigger once. Default: true */
  once?: boolean
}

export function useReveal({
  threshold = 0.15,
  delay = 0,
  once = true,
}: UseRevealOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const controls = useAnimation()
  const isInView = useInView(ref, { amount: threshold, once })

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      controls.set('visible')
      return
    }

    if (isInView) {
      const timer = setTimeout(() => {
        controls.start('visible')
      }, delay * 1000)
      return () => clearTimeout(timer)
    } else if (!once) {
      controls.start('hidden')
    }
  }, [isInView, controls, delay, once])

  return { ref, controls, isInView }
}

/**
 * useRevealStagger — For stagger containers
 * Returns ref + controls for a container where children stagger in.
 */
export function useRevealStagger(options?: UseRevealOptions) {
  return useReveal(options)
}
