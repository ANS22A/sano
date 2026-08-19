# SANO LUNA — Security Audit
# Phase 6.5 — Booking System

**Audit date:** 2026-08-19  
**Auditor:** Antigravity  
**Build status at audit start:** `lint ✅ 0 errors | build ✅ successful`

---

## 1. RLS STATUS — All Tables

> RLS is **enabled** on all 13 public tables. Confirmed via `pg_tables.rowsecurity`.

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Risk |
|---|---|---|---|---|---|---|
| `services` | ✅ | `anon`+`auth` (is_active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `service_categories` | ✅ | `anon`+`auth` (active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `service_options` | ✅ | `anon`+`auth` (active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `service_benefits` | ✅ | `anon`+`auth` (all) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `staff` | ✅ | `anon`+`auth` (is_active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `staff_availability` | ✅ | `anon`+`auth` (is_active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `staff_services` | ✅ | `anon`+`auth` (all) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `locations` | ✅ | `anon`+`auth` (is_active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `business_hours` | ✅ | `anon`+`auth` (all) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `blackout_dates` | ✅ | `anon`+`auth` (is_active=true only) | ❌ None | ❌ None | ❌ None | ✅ SAFE |
| `customers` | ✅ | `auth` only | `anon` WITH CHECK `(phone≥10 chars AND name≥2 chars)` | ❌ None | ❌ None | ⚠️ MEDIUM |
| `bookings` | ✅ | `auth` only | `anon` WITH CHECK `(location_id NOT NULL, customer_id NOT NULL, price_sar>0, status='pending', date>=CURRENT_DATE)` | ❌ None | ❌ None | ⚠️ MEDIUM |
| `booking_items` | ✅ | `auth` only | `service_role` only | `service_role` only | `service_role` only | ✅ SAFE |

### RLS Findings

**CRITICAL (Fixed):** The original policies allowed anonymous INSERT on `bookings`, `customers`, and `booking_items` with `WITH CHECK: true` — meaning any browser with the anon key could write arbitrary rows directly without going through server actions.

**FIXED in Phase 6.5:** Dropped permissive policies. Replaced with:
- `bookings`: anon INSERT requires `location_id NOT NULL`, `customer_id NOT NULL`, `price_sar > 0`, `status = 'pending'`, `date >= CURRENT_DATE`
- `customers`: anon INSERT requires `phone ≥ 10 chars`, `name ≥ 2 chars`  
- `booking_items`: anon INSERT removed entirely — service_role only

**Remaining MEDIUM risk:** The anon key is still used by server actions (this is the standard Supabase pattern). The WITH CHECK constraints are a meaningful defence-in-depth layer. When the admin dashboard is added, `bookings` SELECT should be restricted to `authenticated` with ownership checks.

---

## 2. SERVICE ROLE KEY SECURITY

| Check | Status |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` exposed in NEXT_PUBLIC_* | ✅ NOT exposed |
| `SUPABASE_SERVICE_ROLE_KEY` used only in `admin.ts` | ✅ CONFIRMED |
| `admin.ts` has `import 'server-only'` guard | ✅ CONFIRMED |
| `admin.ts` imported in any client component | ✅ NOT imported anywhere in client code |
| `.env.example` warns about exposure | ✅ Warning present |

**Status: SAFE.** Service role key is server-only, guarded by `server-only`, and not referenced from any client component.

---

## 3. ENVIRONMENT VARIABLES

| Variable | Visibility | Used In | Safe? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Browser (anon client), Server | ✅ Expected public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Browser (anon client), Server | ✅ Expected public — not a secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | `admin.ts` (server-only) | ✅ SAFE |
| `NEXT_PUBLIC_SITE_URL` | Public | SEO/canonical | ✅ Safe |

**No `.env.local` found** — developer must create from `.env.example`. Template is complete and accurate.

---

## 4. BOOKING CREATION SECURITY (`createBooking`)

| Check | Status | Notes |
|---|---|---|
| Zod schema validation | ✅ | Full schema, Saudi phone regex, email format |
| Server-side past-date check | ✅ **ADDED in 6.5** | Asia/Riyadh timezone, blocks past dates |
| Price from server, never client | ✅ | `resolveServicePrice()` reads data layer |
| Duration from server, never client | ✅ | `resolveServiceDuration()` reads data layer |
| Location validated server-side | ✅ | `getLocationById()` before any DB write |
| Slot re-verified before insert | ✅ | Full slot re-calc with current bookings |
| Double-booking: DB unique index | ✅ | `idx_bookings_slot` partial unique index |
| Double-booking: 23505 caught | ✅ | Friendly error returned |
| Customer upsert by normalized phone | ✅ | Phone normalized, existing customer detected |
| SQL injection via Zod/Supabase SDK | ✅ | Parameterized queries via Supabase SDK |
| XSS via customer name/notes | ✅ | Next.js/React auto-escapes all rendered content |
| Staff ID from client trusted | ✅ | Staff not in booking flow yet — N/A |
| `getBookingSlots` validates location | ✅ **ADDED in 6.5** | Invalid location IDs return empty |
| `getBookingSlots` validates date format | ✅ **ADDED in 6.5** | Regex guard before DB query |
| `getBookingSlots` rejects past dates | ✅ **ADDED in 6.5** | Same Riyadh-aware check |

---

## 5. DATABASE CONSTRAINTS & INTEGRITY

| Constraint | Table | Status |
|---|---|---|
| PK on all tables | All | ✅ UUID primary keys |
| UNIQUE `phone` | `customers` | ✅ |
| UNIQUE `booking_number` | `bookings` | ✅ |
| UNIQUE `(location_id, date, start_time) WHERE status != cancelled` | `bookings` | ✅ Anti-double-booking |
| UNIQUE `(location_id, day_of_week)` | `business_hours` | ✅ |
| FK `bookings → customers` | `bookings` | ✅ |
| FK `bookings → locations` | `bookings` | ✅ |
| FK `bookings → services` | `bookings` | ✅ (nullable) |
| `date >= CURRENT_DATE` in RLS | `bookings` | ✅ ADDED in 6.5 |
| NOT NULL on required booking fields | `bookings` | ✅ |
| Booking status is enum type | `bookings` | ✅ `booking_status` enum |

---

## 6. ICS CALENDAR

| Check | Status | Notes |
|---|---|---|
| RFC 5545 compliant | ✅ **FIXED in 6.5** | VTIMEZONE block added |
| TZID without VTIMEZONE | ❌ → **FIXED** | Was missing; now present |
| Line folding (>75 chars) | ✅ **ADDED in 6.5** | Folds long lines correctly |
| Timezone: Asia/Riyadh | ✅ | Hardcoded correctly, no UTC conversion |
| Unique UID per booking | ✅ | `{booking_number}@sanoluna.com` |
| DTSTAMP in UTC (Z suffix) | ✅ | Correct |
| Special chars escaped | ✅ | Backslash, semicolon, comma, newline |

---

## 7. INPUT VALIDATION AUDIT

| Field | Min | Max | Format check | Server-validated |
|---|---|---|---|---|
| `fullName` | 2 chars | 100 chars | trim() | ✅ |
| `phone` | Saudi regex | — | `+966/0966/966/05/5` | ✅ |
| `email` | valid format | — | RFC 5322 | ✅ |
| `notes` | 0 | 500 chars | trim() | ✅ |
| `date` | today (Riyadh) | — | `YYYY-MM-DD` regex | ✅ |
| `startTime` | — | — | `HH:MM` regex | ✅ |
| `serviceId`/`packageSlug` | at least one | — | exists in data layer | ✅ |
| `locationId` | — | — | exists in data layer | ✅ |

**XSS:** React auto-escapes all `{expression}` renders. No `dangerouslySetInnerHTML` found in booking components. ✅ SAFE.

---

## 8. CUSTOMER PRIVACY

| Scenario | Protected? |
|---|---|
| Anonymous user reads all customers via Supabase client | ✅ Blocked (auth-only SELECT) |
| Anonymous user reads another customer's bookings | ✅ Blocked (auth-only SELECT) |
| URL parameter exposure of customer ID | ✅ None — booking number used |
| Booking confirmation exposes DB UUID | ✅ No — only `booking_number` (SL-YYYY-NNNNNN) |
| Customer phone in confirmation response | ⚠️ Normalized phone returned — intentional for display |
| Customer email in confirmation | ⚠️ Returned — used for "Add to Calendar" label |

---

## 9. BOOKING NUMBER FORMAT

Format: `SL-{YYYY}-{NNNNNN}` (e.g. `SL-2026-000001`)  
Generated by: Supabase sequence + trigger (server-side)  
Customer-facing: Yes — safe to display  
DB UUID: Never exposed to customer  
Unique constraint: ✅ `bookings_booking_number_key`

---

## 10. FINDINGS SUMMARY

### CRITICAL (Fixed)
| # | Finding | Fix Applied |
|---|---|---|
| C1 | `anon` could INSERT bookings directly with `WITH CHECK: true` — bypassing server action entirely | ✅ RLS hardened with strict WITH CHECK constraints |
| C2 | `anon` could INSERT customers directly with no restrictions | ✅ RLS hardened with length checks |
| C3 | `anon` could INSERT booking_items with `WITH CHECK: true` | ✅ Locked to service_role only |
| C4 | No server-side past-date validation — client-only guard bypassable | ✅ Server-side Asia/Riyadh date check added |

### HIGH (Fixed)
| # | Finding | Fix Applied |
|---|---|---|
| H1 | ICS missing VTIMEZONE component — Apple Calendar/Outlook may reject | ✅ VTIMEZONE block added |
| H2 | ICS no line folding — RFC 5545 violation for long fields | ✅ 75-char line folding implemented |
| H3 | `getBookingSlots` accepted arbitrary locationId without validation | ✅ Location validated before DB query |
| H4 | `getBookingSlots` accepted malformed date strings without validation | ✅ Regex + past-date guard added |

### MEDIUM (Documented — not fixed, no admin yet)
| # | Finding | When to Fix |
|---|---|---|
| M1 | `customers` SELECT allows all `authenticated` users to read all customers | When admin dashboard adds role-based access |
| M2 | `bookings` SELECT allows all `authenticated` users to read all bookings | When admin dashboard adds role-based access |
| M3 | No rate limiting on `createBooking` server action | When deploying to production — use Vercel Edge Config or Upstash |
| M4 | Location demo data (`riyadh-main`) uses placeholder address/phone | Replace with real SANO LUNA data before launch |

### LOW (Documented)
| # | Finding |
|---|---|
| L1 | `staff_services` SELECT has no row restriction (`qual: true`) — all staff-service mappings visible to anon. Acceptable for a spa (no sensitive data). |
| L2 | `business_hours` SELECT has no row restriction — intentional (public info). |
| L3 | Customer phone returned in `BookingResult` — intentional for display. Remove if not needed in UI. |
| L4 | No booking cancellation flow — bookings cannot be cancelled by customers. Future feature. |

---

## FINAL STATUS

```
npm run lint  → ✅ 0 errors, 0 warnings
npm run build → ✅ Successful
```

**VERDICT: READY FOR ADMIN DASHBOARD DEVELOPMENT**

All CRITICAL and HIGH issues resolved. Database integrity is strong. Server-side validation is authoritative. Service role key is properly isolated.

Before production launch, address M1-M4 (rate limiting most important).
