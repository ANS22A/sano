import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn() — Class Name utility
 * Merges Tailwind classes intelligently, resolving conflicts.
 *
 * @example
 * cn('px-4 py-2', 'px-8') // → 'py-2 px-8'
 * cn('text-red-500', condition && 'text-green-500') // → conditional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
