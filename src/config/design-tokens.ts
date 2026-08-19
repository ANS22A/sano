/**
 * SANO LUNA — Design Tokens
 *
 * Single source of truth for all design decisions.
 * Maps to CSS custom properties in globals.css.
 * Use in TypeScript/JS for programmatic access (e.g., Framer Motion values).
 */

// ─────────────────────────────────────────────
// COLOR TOKENS
// ─────────────────────────────────────────────

export const colors = {
  // Brand
  primary:          '#6B5E52',
  primaryHover:     '#5A4F45',
  primaryForeground:'#FFFFFF',

  accent:           '#C9A882',
  accentForeground: '#1A1714',
  accentSubtle:     '#F2EBE1',

  // Backgrounds
  background:       '#FAF9F7',
  surface:          '#F5F2EE',
  surfaceElevated:  '#FFFFFF',
  surfaceMuted:     '#F0EDE8',

  // Text
  foreground:       '#1A1714',
  foregroundSecondary: '#4A4542',
  mutedForeground:  '#9B9189',

  // Borders
  border:           '#E8E4DF',
  borderSubtle:     '#F0EDE8',
  borderStrong:     '#C8C3BC',

  // Semantic
  success:          '#4A7C59',
  warning:          '#A86826',
  error:            '#C0392B',
  info:             '#2C6E8A',

  // Dark mode background (for dark sections)
  darkBackground:   '#16130F',
  darkSurface:      '#1E1B17',
} as const

// ─────────────────────────────────────────────
// SPACING TOKENS (in pixels)
// ─────────────────────────────────────────────

export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  24:  96,
  30:  120,
  40:  160,
} as const

// ─────────────────────────────────────────────
// TYPOGRAPHY TOKENS
// ─────────────────────────────────────────────

export const typography = {
  fonts: {
    displayEn:  "'Cormorant Garamond', 'Georgia', serif",
    bodyEn:     "'DM Sans', 'system-ui', sans-serif",
    displayAr:  "'Noto Naskh Arabic', serif",
    bodyAr:     "'Noto Sans Arabic', sans-serif",
    mono:       "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
  },
  weights: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  lineHeights: {
    tight:         1.1,
    heading:       1.2,
    headingAr:     1.5,
    body:          1.75,
    bodyAr:        2.0,
    relaxed:       2.0,
  },
  letterSpacings: {
    tighter:  '-0.025em',
    tight:    '-0.015em',
    normal:   '0em',
    wide:     '0.04em',
    wider:    '0.08em',
    widest:   '0.12em',
  },
} as const

// ─────────────────────────────────────────────
// BORDER RADIUS TOKENS
// ─────────────────────────────────────────────

export const radii = {
  none:  '0',
  xs:    '2px',
  sm:    '4px',
  md:    '6px',
  lg:    '8px',
  xl:    '12px',
  '2xl': '16px',
  '3xl': '24px',
  pill:  '9999px',
} as const

// ─────────────────────────────────────────────
// SHADOW TOKENS
// ─────────────────────────────────────────────

export const shadows = {
  none:     'none',
  subtle:   '0 1px 3px 0 rgb(26 23 20 / 0.04), 0 1px 2px -1px rgb(26 23 20 / 0.04)',
  medium:   '0 4px 16px -2px rgb(26 23 20 / 0.08), 0 2px 8px -2px rgb(26 23 20 / 0.04)',
  elevated: '0 12px 40px -4px rgb(26 23 20 / 0.12), 0 4px 16px -4px rgb(26 23 20 / 0.06)',
  luxury:   '0 24px 64px -8px rgb(26 23 20 / 0.16)',
} as const

// ─────────────────────────────────────────────
// MOTION TOKENS
// ─────────────────────────────────────────────

export const motion = {
  duration: {
    fast:   0.15,
    normal: 0.3,
    slow:   0.5,
    reveal: 0.6,
  },
  easing: {
    smooth:  [0.4, 0, 0.2, 1],
    luxury:  [0.25, 0.46, 0.45, 0.94],
    easeOut: [0, 0, 0.2, 1],
    easeIn:  [0.4, 0, 1, 1],
  },
  stagger: {
    fast:   0.03,
    normal: 0.06,
    slow:   0.1,
  },
} as const

// ─────────────────────────────────────────────
// BREAKPOINTS (in px)
// ─────────────────────────────────────────────

export const breakpoints = {
  xs:   375,
  sm:   640,
  md:   768,
  lg:   1024,
  xl:   1280,
  '2xl': 1440,
  '3xl': 1920,
} as const

// ─────────────────────────────────────────────
// CONTAINER WIDTHS (in px)
// ─────────────────────────────────────────────

export const containers = {
  narrow:    768,
  default:   1280,
  wide:      1440,
} as const

// ─────────────────────────────────────────────
// NAVIGATION TOKENS
// ─────────────────────────────────────────────

export const navigation = {
  heightDesktop: 80,
  heightMobile:  64,
} as const

// ─────────────────────────────────────────────
// ICON SYSTEM TOKENS
// ─────────────────────────────────────────────

export const icons = {
  size: {
    xs:   12,
    sm:   16,
    md:   20,
    lg:   24,
    xl:   32,
  },
  strokeWidth: {
    light:  1,
    normal: 1.5,
    bold:   2,
  },
} as const

// ─────────────────────────────────────────────
// SECTION PADDING TOKENS
// ─────────────────────────────────────────────

export const sectionPadding = {
  sm:      { desktop: 64,  tablet: 48,  mobile: 40  },
  default: { desktop: 120, tablet: 80,  mobile: 60  },
  lg:      { desktop: 160, tablet: 100, mobile: 80  },
} as const

// ─────────────────────────────────────────────
// IMAGE ASPECT RATIOS
// ─────────────────────────────────────────────

export const aspectRatios = {
  portrait:       '3 / 4',
  landscape:      '16 / 9',
  square:         '1 / 1',
  hero:           '21 / 9',
  heroMobile:     '4 / 5',
  card:           '4 / 3',
  teamPortrait:   '2 / 3',
} as const

// ─────────────────────────────────────────────
// GRID TOKENS
// ─────────────────────────────────────────────

export const grid = {
  columnsDesktop:  12,
  columnsTablet:   8,
  columnsMobile:   4,
  gap: {
    sm:      16,
    default: 24,
    lg:      32,
    xl:      48,
  },
} as const

// ─────────────────────────────────────────────
// GOOGLE FONTS URLs
// ─────────────────────────────────────────────

export const fontUrls = {
  en: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap',
  ar: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap',
} as const
