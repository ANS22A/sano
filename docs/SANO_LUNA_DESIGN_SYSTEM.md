# SANO LUNA DESIGN SYSTEM — SINGLE SOURCE OF TRUTH

**Version:** 2.0 — IMPLEMENTED  
**Date:** 2026-08-24  
**Status:** ACTIVE — This document describes the CURRENT implementation.

---

> **PERMANENT DEVELOPMENT RULE**
>
> Before creating or modifying any UI, developers and AI agents MUST consult and use this Design System. New colors, spacing values, typography values, shadows, radii, or component patterns must not be introduced arbitrarily. See `docs/SANO_LUNA_UI_DEVELOPMENT_RULES.md` for full enforcement rules.

---

## 1. Brand Identity

**SANO LUNA — Quiet Luxury Spa**

Visual direction: Elegant · Calm · Premium · Minimal · Sophisticated · Warm · Modern · Spa-oriented

The interface must NOT be overwhelmingly purple. Use light, airy backgrounds with purple reserved for navigation, primary actions, and strong headings. Gold is a restrained premium accent.

---

## 2. Color Tokens

### 2.1 Brand Palette

| Token Name | CSS Variable | Hex | Purpose |
|-----------|-------------|-----|---------|
| Deep Royal Purple | `--primary` | `#3B1F4A` | Primary CTA, sidebar bg, important headings |
| Mauve Purple | `--primary-hover` / `--ring` | `#76547A` | Hover states, focus rings, secondary text accent |
| Lavender | `--border-strong` | `#B9A5C8` | Emphasized borders, decorative elements |
| Soft Pink Mauve | *(available for accents)* | `#D8B8C8` | Subtle feminine spa accents |
| Very Light Lilac | `--surface-muted` / `--secondary` / `--muted` | `#F6F1F7` | Muted section backgrounds |
| Warm Gold | `--accent` | `#C9A96E` | Premium accent — VERY LIMITED use |

### 2.2 Supporting Neutrals

| Token Name | CSS Variable | Hex | Purpose |
|-----------|-------------|-----|---------|
| Deep Charcoal | `--foreground` | `#29232B` | Primary readable text |
| Muted Plum Gray | `--muted-foreground` | `#766B78` | Secondary text, captions |
| Soft White | `--background` | `#FFFCFE` | Page background |

### 2.3 Semantic States

| State | Text (`--{state}`) | Background (`--{state}-bg`) | Border (`--{state}-border`) |
|-------|--------|------------|--------|
| Success | `#3D7A52` | `#EFF7F1` | `#C2DEC9` |
| Warning | `#9A6B2F` | `#FDF6EC` | `#EDDCB8` |
| Error | `#B53B2E` | `#FDF0EE` | `#F0C5BF` |
| Info | `#2C6882` | `#EEF5F8` | `#BBD6E0` |

Tailwind usage: `text-success`, `bg-warning-bg`, `border-error-border`, etc.

### 2.4 Where Colors Must NOT Be Used

| Color | Must NOT use for |
|-------|-----------------|
| Deep Royal Purple | Large background fills (except sidebar), body text |
| Warm Gold | Backgrounds, large areas, body text |
| Very Light Lilac | Text, strong borders |
| Deep Charcoal | Decorative accents |

---

## 3. Background Hierarchy

| Layer | Token | Hex | Tailwind Class |
|-------|-------|-----|---------------|
| Page background | `--background` | `#FFFCFE` | `bg-background` |
| Muted sections | `--surface-muted` | `#F6F1F7` | `bg-surface-muted` |
| Cards / elevated | `--card` | `#FFFFFF` | `bg-card` or `bg-white` |
| Admin sidebar | `--sidebar` | `#3B1F4A` | `bg-primary` |
| Admin header | N/A | `rgba(255,252,254,0.95)` | backdrop-blur |

---

## 4. Text Hierarchy

| Level | Token | Hex | Tailwind Class |
|-------|-------|-----|---------------|
| Primary text | `--foreground` | `#29232B` | `text-foreground` |
| Secondary text | `--muted-foreground` | `#766B78` | `text-muted-foreground` |
| On primary bg | `--primary-foreground` | `#FFFFFF` | `text-primary-foreground` |
| Accent highlight | `--accent` | `#C9A96E` | `text-accent` (limited) |

---

## 5. Button Hierarchy

| Variant | Class | Background | Text | Hover |
|---------|-------|-----------|------|-------|
| Primary | `.btn-primary` | `--primary` | white | `--primary-hover` |
| Secondary | `.btn-secondary` | `--secondary` | `--secondary-foreground` | `--secondary-hover` |
| Outline | `.btn-outline` | transparent | `--primary` | `--surface-muted` bg |
| Ghost | `.btn-ghost` | transparent | `--foreground` | `--muted` bg |
| Accent/Premium | `.btn-accent` | `--accent` | `--foreground` | `--primary` bg |
| Danger | `bg-error` | `--error` | white | opacity 90% |

---

## 6. Border System

| Level | Token | Hex | Tailwind Class |
|-------|-------|-----|---------------|
| Default | `--border` | `#E8DFE9` | `border-border` |
| Subtle | `--border-subtle` | `#F0EAF1` | `border-border-subtle` |
| Strong | `--border-strong` | `#B9A5C8` | `border-border-strong` |

---

## 7. Shadow System

All shadows use purple-tinted base `rgb(59, 31, 74)`:

| Level | Token | Tailwind Class | Usage |
|-------|-------|---------------|-------|
| None | — | `shadow-none` | Flat elements |
| Subtle | `--shadow-subtle` | `shadow-subtle` | Default cards, header |
| Medium | `--shadow-medium` | `shadow-medium` | Hover cards, dropdowns |
| Elevated | `--shadow-elevated` | `shadow-elevated` | Modals, popovers |
| Luxury | `--shadow-luxury` | `shadow-luxury` | Feature highlights |

---

## 8. Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inputs, small buttons |
| `--radius-md` | 6px | Default |
| `--radius-lg` | 8px | Cards |
| `--radius-xl` | 12px | Admin cards, sidebar items |
| `--radius-2xl` | 16px | Modals, login cards |
| `--radius-pill` | 9999px | Badges, pills |

---

## 9. Typography System

### Fonts
| Language | Display | Body |
|----------|---------|------|
| English | Cinzel (serif) | Montserrat (sans-serif) |
| Arabic | Cairo | Tajawal |

### Scale (defined in globals.css)
| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.text-display-xl` | clamp(3rem, 7vw, 5.5rem) | 400 | Hero headline |
| `.text-display` | clamp(2.25rem, 5vw, 3.5rem) | 500 | Large section titles |
| `.text-h1` | clamp(2rem, 4vw, 3rem) | 500 | Page headings |
| `.text-h2` | clamp(1.625rem, 3vw, 2.25rem) | 600 | Section headings |
| `.text-h3` | clamp(1.375rem, 2.5vw, 1.75rem) | 600 | Subsection headings |
| `.text-h4` | 1.25rem | 600 | Card headings |
| `.text-body-lg` | 1.125rem | 400 | Large body |
| `.text-body` | 1rem | 400 | Standard body |
| `.text-body-sm` | 0.875rem | 400 | Small body |
| `.text-caption` | 0.75rem | 400 | Captions |
| `.text-label` | 0.875rem | 600 | Form labels |
| `.text-button` | 0.875rem | 500 | Button text |
| `.text-nav` | 0.875rem | 500 | Navigation links |
| `.text-overline` | 0.6875rem | 600 | Category labels |
| `.text-price` | 1.5rem | 500 | Price display |

### Arabic Overrides
- `letter-spacing: 0` always
- `text-transform: none` always
- `line-height: 2` for body, `1.5` for headings
- Font automatically switches via `:lang(ar)` / `[dir="rtl"]` selectors

---

## 10. Spacing System

Defined in `@theme inline`:

| Token | Value |
|-------|-------|
| `--spacing-1` | 4px |
| `--spacing-2` | 8px |
| `--spacing-3` | 12px |
| `--spacing-4` | 16px |
| `--spacing-6` | 24px |
| `--spacing-8` | 32px |
| `--spacing-12` | 48px |
| `--spacing-16` | 64px |
| `--spacing-20` | 80px |
| `--spacing-24` | 96px |

---

## 11. Component Variants

### Cards (globals.css)
| Class | Usage |
|-------|-------|
| `.card-sl` | Generic card |
| `.card-service` | Service listing card |
| `.card-team` | Team member card |
| `.card-testimonial` | Testimonial card |
| `.card-feature` | Feature highlight |
| `.card-gallery` | Gallery image card |
| `.card-package` | Package card |

### Badges (globals.css)
| Class | Usage |
|-------|-------|
| `.badge-default` | Neutral badge |
| `.badge-primary` | Primary brand badge |
| `.badge-accent` | Gold accent badge |
| `.badge-success` | Success state |
| `.badge-warning` | Warning state |
| `.badge-error` | Error state |
| `.badge-featured` | Featured/new tag |

### Admin Status Badges (AdminBadge.tsx)
Uses semantic tokens: `bg-success-bg text-success`, `bg-warning-bg text-warning`, etc.

### Forms (globals.css)
| Class | Usage |
|-------|-------|
| `.form-input` | Text input |
| `.form-textarea` | Textarea |
| `.form-label` | Form label |
| `.form-helper` | Helper text |
| `.form-error` | Error message |
| `.form-group` | Form field group |

### Sections (globals.css)
| Class | Usage |
|-------|-------|
| `.section-standard` | Standard section padding |
| `.section-editorial` | Large editorial section |
| `.section-dark` | Dark purple section |
| `.section-fullbleed` | Full-width section |
| `.section-centered` | Centered text section |

---

## 12. Admin Dashboard Colors

- Stat cards: `bg-white`, `border-border`, `shadow-subtle`, hover `shadow-medium`
- Accent stat card: `bg-primary`, `text-primary-foreground`, value in `text-accent`
- Trend indicators: `text-success` / `text-error` / `text-muted-foreground`

## 13. Sidebar

- Background: `--sidebar` (`#3B1F4A`)
- Active item: `bg-white/12 text-white border-s-2 border-s-accent`
- Hover item: `bg-white/8 text-white`
- Group labels: `text-white/30`

## 14. Modal Dialogs

- Overlay: `rgba(59, 31, 74, 0.5)` with `backdrop-blur`
- Content: `bg-card`, `border-border-subtle`, `shadow-luxury`
- Radius: `--radius-2xl`

## 15. Navigation

- Desktop: backdrop-blur with `rgba(255, 252, 254, 0.95)`
- Active link: `text-primary`
- Hover: `text-primary-hover`

---

## 16. RTL / LTR Considerations

- All spacing uses `margin-inline`, `padding-inline`, `inset-inline-start/end`
- Typography switches automatically via `:lang(ar)` / `[dir="rtl"]` selectors
- No hardcoded `left`/`right` for directional elements
- Arabic: `letter-spacing: 0`, `text-transform: none`, generous `line-height`

---

## 17. Responsive Breakpoints

| Name | Value |
|------|-------|
| xs | 375px |
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1440px |
| 3xl | 1920px |

---

## 18. Transitions & Animations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Buttons, inputs |
| `--duration-normal` | 300ms | Cards, dropdowns |
| `--duration-slow` | 500ms | Page transitions |
| `--duration-reveal` | 600ms | Scroll reveals |
| `--ease-smooth` | cubic-bezier(0.4, 0, 0.2, 1) | General |
| `--ease-luxury` | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Premium |

---

## 19. Z-Index Layers

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default content |
| Sticky header | 30 | Admin header |
| Mobile sidebar | 50 | Slide-over nav |
| Modal overlay | 50 | Modals |

---

## 20. Accessibility

- Focus ring: `2px solid var(--ring)` with `3px` offset
- Selection: `var(--accent-subtle)` background
- Reduced motion: All animations respect `prefers-reduced-motion`
- Minimum contrast: All text/background combinations meet WCAG 2.1 AA

---

## 21. Third-Party Color Exceptions

| Color | Hex | Reason |
|-------|-----|--------|
| WhatsApp Green | `#25D366` | Brand requirement for WhatsApp share buttons |
| Gift Card Voucher Themes | Various | Decorative voucher backgrounds — separate concern |

---

## 22. Architecture Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Authoritative CSS token definitions, component primitives |
| `src/config/design-tokens.ts` | TypeScript token constants for programmatic use |
| `src/lib/notifications/email.service.ts` | Email brand constants (inline styles required) |
| `docs/SANO_LUNA_DESIGN_SYSTEM.md` | This document — design authority |
| `docs/SANO_LUNA_UI_DEVELOPMENT_RULES.md` | Development rules and enforcement |

---

## 23. How to Extend the Design System

### Adding a New Token
1. Define in `globals.css` `:root { }` block
2. Add Tailwind mapping in `@theme inline { }` if needed
3. Update `design-tokens.ts` if programmatic access is needed
4. Document in this file

### Adding a New Component Variant
1. Define in `globals.css` `@layer components { }`
2. Include Arabic/RTL overrides if text-related
3. Document in this file under Component Variants

### Handling an Uncovered Requirement
1. Check if an existing token can serve the purpose
2. If not, propose a new token following the naming convention
3. Get approval before implementation
4. Add to all three sources (CSS, TS, docs)

### Preventing Design Drift
- Run periodic compliance scans for hardcoded hex values
- Search for: `#[0-9a-fA-F]{6}` in `.tsx` files
- Search for: `bg-red-`, `bg-green-`, `bg-amber-`, `bg-slate-` etc.
- Any finding must be either migrated to a token or documented as an exception

### Reviewing UI Consistency
- Compare new components against existing ones for visual harmony
- Verify shadow, radius, border, and spacing consistency
- Test in both English (LTR) and Arabic (RTL) modes
- Test across mobile, tablet, and desktop viewports
