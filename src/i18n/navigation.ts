import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Typed navigation helpers — use these instead of next/navigation throughout the app
export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing)
