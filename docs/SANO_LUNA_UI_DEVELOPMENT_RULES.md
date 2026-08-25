# SANO LUNA — UI DEVELOPMENT RULES

**MANDATORY: Read before modifying any UI in the SANO LUNA project.**

This document establishes permanent rules for UI development in SANO LUNA. These rules apply to human developers and AI agents alike.

---

## Rule 1: Design System First

Before creating or modifying ANY UI component, page, or visual element:

1. Read `docs/SANO_LUNA_DESIGN_SYSTEM.md`
2. Check if an existing design token covers your requirement
3. Check if an existing component variant already handles your use case
4. Only then proceed with implementation

## Rule 2: Never Invent Brand Colors

The approved SANO LUNA palette is:

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Royal Purple | `#3B1F4A` | Primary actions, sidebar, strong headings |
| Mauve Purple | `#76547A` | Secondary UI, hover states, focus rings |
| Lavender | `#B9A5C8` | Decorative, icon tints, strong borders |
| Soft Pink Mauve | `#D8B8C8` | Subtle feminine accents |
| Very Light Lilac | `#F6F1F7` | Muted backgrounds, secondary surfaces |
| Warm Gold | `#C9A96E` | Premium accent — VERY LIMITED |
| Deep Charcoal | `#29232B` | Primary text |
| Muted Plum Gray | `#766B78` | Secondary text |
| Soft White | `#FFFCFE` | Page backgrounds |

**Do NOT introduce any color that is not in this palette without updating the Design System first.**

## Rule 3: Never Hardcode Brand Hex Values Inside Components

❌ **Wrong:**
```tsx
<div className="text-[#A98FB8]">
<div style={{ color: '#6F4E7C' }}>
<div className="bg-[#2E1F38]">
```

✅ **Correct:**
```tsx
<div className="text-muted-foreground">
<div className="text-primary">
<div className="bg-primary">
```

The ONLY exception is email templates (`email.service.ts`) which require inline styles, and these must use the centralized brand constants.

## Rule 4: Never Create Duplicate Button/Card/Input Styles

If an existing Design System variant covers your requirement, use it. Do not create a second version in a component file.

Check `globals.css` for existing variants:
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-accent`
- Cards: `.card-sl`, `.card-service`, `.card-team`, `.card-testimonial`, `.card-feature`, `.card-gallery`, `.card-package`
- Inputs: `.form-input`, `.form-textarea`, `.form-label`, `.form-helper`, `.form-error`
- Badges: `.badge-default`, `.badge-primary`, `.badge-accent`, `.badge-success`, `.badge-warning`, `.badge-error`

## Rule 5: Use Design Tokens

Always use CSS custom properties (via Tailwind token classes) instead of arbitrary values:

| Category | Token Examples | Tailwind Classes |
|----------|---------------|-----------------|
| Background | `--background`, `--surface-muted` | `bg-background`, `bg-surface-muted` |
| Text | `--foreground`, `--muted-foreground` | `text-foreground`, `text-muted-foreground` |
| Border | `--border`, `--border-strong` | `border-border`, `border-border-strong` |
| Shadow | `--shadow-subtle`, `--shadow-medium` | `shadow-subtle`, `shadow-medium` |
| Semantic | `--success`, `--error`, `--warning` | `text-success`, `bg-error-bg`, `border-warning-border` |

## Rule 6: Use Existing Components

Before creating a new component, check:
- `src/components/admin/ui/` — Admin primitives
- `src/components/ui/` — Shared UI components
- `src/components/home/` — Homepage sections
- `src/components/services/` — Service-related
- `src/components/booking/` — Booking flow
- `src/components/auth/` — Authentication forms
- `src/components/gift-cards/` — Gift card UI

## Rule 7: Preserve RTL/LTR

SANO LUNA supports Arabic (RTL) and English (LTR).

Rules:
- Use `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right`
- Use `padding-inline` instead of `padding-left` / `padding-right`
- Use `inset-inline-start` / `inset-inline-end` for positioning
- Use `text-start` / `text-end` instead of `text-left` / `text-right`
- Use `start-*` / `end-*` Tailwind utilities
- Never use negative `letter-spacing` with Arabic text
- Always set `letter-spacing: 0` for Arabic typography
- Always set `text-transform: none` for Arabic text

## Rule 8: Preserve Responsive Behavior

All UI must work across:
- Mobile (375px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large Desktop (1440px+)

Use the responsive utilities and breakpoints defined in the Design System. Do not create separate mobile-only or desktop-only visual systems.

## Rule 9: Preserve Accessibility

- Maintain WCAG 2.1 AA contrast ratios
- Always provide visible focus states using `focus-visible` / `--ring`
- Use semantic HTML elements
- Include `aria-label`, `role`, and other ARIA attributes where appropriate
- Ensure all interactive elements are keyboard navigable
- Never remove focus outlines without providing an alternative

## Rule 10: Do Not Introduce New Visual Patterns Without Documentation

If you need a visual element not covered by the Design System:
1. Document the requirement
2. Propose the addition to `docs/SANO_LUNA_DESIGN_SYSTEM.md`
3. Define the token / variant with the same structure as existing entries
4. Get approval
5. Then implement

## Rule 11: Do Not Modify the Design System Casually

The Design System (`globals.css` `:root` tokens) is the foundation of the entire visual identity.

**Changing a token value changes EVERY component consuming it.**

Before modifying any token:
1. Understand the full scope of impact
2. Verify contrast ratios
3. Check RTL appearance
4. Check responsive behavior
5. Run a visual regression check

## Rule 12: Extend the Design System First, Then Implement

When a new visual requirement appears:

```
1. Define the token in globals.css :root
2. Add the Tailwind mapping in @theme inline if needed
3. Create the component variant in globals.css @layer components if appropriate
4. Document in SANO_LUNA_DESIGN_SYSTEM.md
5. THEN implement in the feature component
```

**Never implement first and document later.**

---

## Semantic Color Rules

### Status States

Use the semantic token system consistently:

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Success | `bg-success-bg` | `text-success` | `border-success-border` |
| Warning | `bg-warning-bg` | `text-warning` | `border-warning-border` |
| Error | `bg-error-bg` | `text-error` | `border-error-border` |
| Info | `bg-info-bg` | `text-info` | `border-info-border` |
| Neutral | `bg-muted` | `text-muted-foreground` | `border-border` |

❌ **Never use:**
```tsx
bg-red-50 text-red-600 border-red-200
bg-emerald-50 text-emerald-700
bg-amber-100 text-amber-800
bg-slate-100 text-slate-500
```

### Third-Party Brand Colors

The only acceptable hardcoded colors are third-party brand requirements:
- WhatsApp: `#25D366` — Only in WhatsApp-specific buttons
- No other third-party colors should be hardcoded without documentation

---

## Component Governance Hierarchy

```
Design Tokens (globals.css :root)
  ↓
Design System Primitives (globals.css @layer components)
  ↓
Shared Components (src/components/ui/, src/components/admin/ui/)
  ↓
Feature Components (src/components/home/, src/components/booking/, etc.)
  ↓
Pages (src/app/)
```

Pages should consume shared components and feature components.  
Pages should NOT become independent design systems.

---

## AI Agent Specific Instructions

If you are an AI coding agent working on SANO LUNA:

1. **READ THIS FILE** and `docs/SANO_LUNA_DESIGN_SYSTEM.md` before making any UI changes
2. **CHECK** `src/app/globals.css` for available tokens before introducing any visual value
3. **SEARCH** for existing components before creating new ones
4. **USE** `text-foreground`, `bg-background`, `border-border`, etc. — never hardcode hex values
5. **VERIFY** your changes with `npx tsc --noEmit && npm run lint && npm run build`
6. **DO NOT** silently change token values in `:root` without explicit user approval
7. **DO NOT** introduce `bg-red-*`, `bg-green-*`, `bg-blue-*`, `bg-amber-*`, etc. — use semantic tokens
8. **DO NOT** use arbitrary shadow values — use `shadow-subtle`, `shadow-medium`, `shadow-elevated`
9. **PRESERVE** Arabic RTL support in every component
10. **DOCUMENT** any new visual pattern you introduce
