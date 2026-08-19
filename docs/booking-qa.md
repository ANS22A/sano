# SANO LUNA — Booking System QA Checklist
# Phase 6.5

**Date:** 2026-08-19  
**Build:** `lint ✅ | build ✅`

---

## HOW TO USE

For each test: note the **Expected** result, perform the test, record **Actual**, and mark **Status**.

Status values: `✅ PASS` | `❌ FAIL` | `⚠️ PARTIAL` | `🔲 NOT TESTED`

---

## A. SECURITY

| # | Test | Expected | Actual | Status |
|---|---|---|---|---|
| A1 | POST directly to Supabase REST API: insert a booking with arbitrary price | Rejected by RLS WITH CHECK (price_sar must be > 0, status must be pending, date >= today) | — | 🔲 |
| A2 | POST booking with date in the past via server action | Returns `VALIDATION_ERROR`, `Cannot book a date in the past` | — | 🔲 |
| A3 | POST booking with invalid serviceId | Returns `SERVICE_NOT_FOUND` | — | 🔲 |
| A4 | POST booking with invalid locationId | Returns `LOCATION_NOT_FOUND` | — | 🔲 |
| A5 | POST booking with malformed phone (e.g. `abc`) | Returns `VALIDATION_ERROR` | — | 🔲 |
| A6 | POST booking with malformed email | Returns `VALIDATION_ERROR` | — | 🔲 |
| A7 | POST booking with name < 2 chars | Returns `VALIDATION_ERROR` | — | 🔲 |
| A8 | POST booking with notes > 500 chars | Returns `VALIDATION_ERROR` | — | 🔲 |
| A9 | Submit `<script>alert(1)</script>` in name field | Rendered as text, no execution | — | 🔲 |
| A10 | Submit SQL-like string in notes: `'; DROP TABLE bookings;--` | Stored as text, no SQL effect | — | 🔲 |
| A11 | Access `/booking?service=nonexistent-slug` | Graceful UI, no error crash | — | 🔲 |
| A12 | Access `/booking?package=nonexistent-slug` | Graceful UI, no error crash | — | 🔲 |
| A13 | Read all customers as anonymous via Supabase anon key | Returns empty / permission denied | — | 🔲 |
| A14 | Read all bookings as anonymous via Supabase anon key | Returns empty / permission denied | — | 🔲 |
| A15 | Check browser bundle for SUPABASE_SERVICE_ROLE_KEY | Not present in any JS bundle | — | 🔲 |

---

## B. DOUBLE-BOOKING

| # | Test | Expected | Actual | Status |
|---|---|---|---|---|
| B1 | Submit two identical bookings (same service, date, time, location) sequentially | First succeeds, second returns `SLOT_UNAVAILABLE` or `DOUBLE_BOOKING` | — | 🔲 |
| B2 | Submit overlapping bookings (service A 09:00–10:30, service B 09:30–11:00) | Second returns `SLOT_UNAVAILABLE` | — | 🔲 |
| B3 | Cancel a booking, then re-book same slot | Second booking succeeds (partial index excludes cancelled) | — | 🔲 |

---

## C. AVAILABILITY

| # | Test | Expected | Actual | Status |
|---|---|---|---|---|
| C1 | Select Monday — slots shown | Slots from 09:00 to 21:00 - duration | — | 🔲 |
| C2 | Select Sunday — slots shown | Slots from 14:00 to 21:00 - duration | — | 🔲 |
| C3 | Select a date that is closed (if blackout added) | No slots available | — | 🔲 |
| C4 | Select a date in the past via URL | No slots returned (server guard) | — | 🔲 |
| C5 | Select today with time already past | Past slots not shown (relies on current slot gen — verified: slot gen uses business hours only, no time-of-day filter yet) | — | 🔲 |
| C6 | Service duration = 120 min, close at 21:00 — last slot | Last slot = 19:00 (19:00+120=21:00) | — | 🔲 |
| C7 | Service duration = 150 min, close at 21:00 — last available slot | Last slot = 18:30 (18:30+150=21:00) | — | 🔲 |

> **NOTE (Medium — undocumented gap):** `getAvailableSlots` does not filter out past time slots on today's date. For example, if today is Monday and it's 15:00, slots at 09:00, 09:30… 14:30 would still appear available. This is a UX issue (not a security issue — the server re-validates the slot before booking). Fix: filter slots where `start < now()` when `date == today`.

---

## D. SERVICES (17)

Verify each service is bookable. Test minimum: load service detail page, click Book, verify pre-selected in Step 1.

| # | Service Slug | Price (SAR) | Duration (min) | Pre-select via URL | Status |
|---|---|---|---|---|---|
| D1 | swedish-massage | — | — | `/booking?service=swedish-massage` | 🔲 |
| D2 | deep-tissue-massage | — | — | `/booking?service=deep-tissue-massage` | 🔲 |
| D3 | hot-stone-massage | — | — | `/booking?service=hot-stone-massage` | 🔲 |
| D4 | aromatherapy-massage | — | — | `/booking?service=aromatherapy-massage` | 🔲 |
| D5 | prenatal-massage | — | — | `/booking?service=prenatal-massage` | 🔲 |
| D6 | sports-massage | — | — | `/booking?service=sports-massage` | 🔲 |
| D7 | lymphatic-drainage | — | — | `/booking?service=lymphatic-drainage` | 🔲 |
| D8 | reflexology | — | — | `/booking?service=reflexology` | 🔲 |
| D9 | head-neck-shoulder | — | — | `/booking?service=head-neck-shoulder` | 🔲 |
| D10 | moroccan-bath | — | — | `/booking?service=moroccan-bath` | 🔲 |
| D11 | classic-facial | — | — | `/booking?service=classic-facial` | 🔲 |
| D12 | hydrating-facial | — | — | `/booking?service=hydrating-facial` | 🔲 |
| D13 | anti-aging-facial | — | — | `/booking?service=anti-aging-facial` | 🔲 |
| D14 | body-scrub | — | — | `/booking?service=body-scrub` | 🔲 |
| D15 | body-wrap | — | — | `/booking?service=body-wrap` | 🔲 |
| D16 | foot-ritual | — | — | `/booking?service=foot-ritual` | 🔲 |
| D17 | scalp-treatment | — | — | `/booking?service=scalp-treatment` | 🔲 |

---

## E. PACKAGES (5)

| # | Package Slug | Price (SAR) | Total Duration | Pre-select via URL | Status |
|---|---|---|---|---|---|
| E1 | sano-luna-journey | — | — | `/booking?package=sano-luna-journey` | 🔲 |
| E2 | brides-glow | — | — | `/booking?package=brides-glow` | 🔲 |
| E3 | mother-daughter-ritual | — | — | `/booking?package=mother-daughter-ritual` | 🔲 |
| E4 | deep-restore | — | — | `/booking?package=deep-restore` | 🔲 |
| E5 | radiance-reset | — | — | `/booking?package=radiance-reset` | 🔲 |

---

## F. BOOKING FLOW UX

| # | Test | Expected | Status |
|---|---|---|---|
| F1 | Complete all 4 steps | Confirmation screen with booking number | 🔲 |
| F2 | Click Back from Step 2 | Returns to Step 1, selections preserved | 🔲 |
| F3 | Click Back from Step 3 | Returns to Step 2, date/time preserved | 🔲 |
| F4 | Click Back from Step 4 | Returns to Step 3, details preserved | 🔲 |
| F5 | Click Edit (Experience) on Step 4 | Jumps to Step 1 | 🔲 |
| F6 | Click Edit (Date/Time) on Step 4 | Jumps to Step 2 | 🔲 |
| F7 | Click Edit (Details) on Step 4 | Jumps to Step 3 | 🔲 |
| F8 | Submit Step 3 with empty name | Inline validation error shown | 🔲 |
| F9 | Submit Step 3 with invalid phone | Saudi phone error shown | 🔲 |
| F10 | Confirmation: Add to Calendar button | `.ics` file downloads | 🔲 |
| F11 | Confirmation: Back to Home | Navigates to home | 🔲 |
| F12 | Access `/booking` with no params | Step 1 loads, nothing pre-selected | 🔲 |

---

## G. RTL (Arabic)

| # | Test | Expected | Status |
|---|---|---|---|
| G1 | `/ar/booking` — progress stepper | Steps ordered right-to-left, Arabic labels | 🔲 |
| G2 | `/ar/booking` — calendar month nav arrows | Previous arrow on right, Next on left | 🔲 |
| G3 | `/ar/booking` — Step 1 service grid | Arabic service names, RTL layout | 🔲 |
| G4 | `/ar/booking` — Step 3 form | Labels right-aligned, inputs RTL | 🔲 |
| G5 | `/ar/booking` — Step 4 review | Summary right-aligned, Arabic labels | 🔲 |
| G6 | `/ar/booking` — Confirmation | Arabic booking number label, RTL | 🔲 |
| G7 | `/ar/booking` — Summary sidebar | Right column (sidebar on left in AR) | 🔲 |
| G8 | `/ar/packages` — package catalog | Arabic names, RTL card layout | 🔲 |

---

## H. LTR (English)

| # | Test | Expected | Status |
|---|---|---|---|
| H1 | `/en/booking` — progress stepper | Steps ordered left-to-right, English labels | 🔲 |
| H2 | `/en/booking` — calendar | LTR, English month names | 🔲 |
| H3 | `/en/booking` — Step 3 form | Labels left-aligned | 🔲 |
| H4 | `/en/booking` — Confirmation | English booking number label | 🔲 |
| H5 | `/en/packages` — package catalog | English names, LTR | 🔲 |

---

## I. MOBILE (Manual, Chrome DevTools)

| # | Viewport | Component | Expected | Status |
|---|---|---|---|---|
| I1 | 320px | Booking calendar | No horizontal overflow | 🔲 |
| I2 | 375px | Booking calendar | No horizontal overflow | 🔲 |
| I3 | 390px | Time slot grid | Slots wrap neatly | 🔲 |
| I4 | 430px | Step 3 form | Full-width inputs, accessible | 🔲 |
| I5 | 375px | Step 4 review | Summary and buttons not cut off | 🔲 |
| I6 | 320px | Progress stepper | Not overflowing, readable | 🔲 |
| I7 | 375px | Packages catalog | Cards stack vertically | 🔲 |

---

## J. ACCESSIBILITY

| # | Test | Expected | Status |
|---|---|---|---|
| J1 | Tab through booking form | Logical focus order | 🔲 |
| J2 | Calendar keyboard navigation | Arrow keys move between days | 🔲 |
| J3 | Service cards keyboard select | Enter/Space selects card | 🔲 |
| J4 | Form error — screen reader | `aria-describedby` links to error | 🔲 |
| J5 | Progress stepper | `aria-label` on nav, step states communicated | 🔲 |
| J6 | Time slots | `aria-pressed` on selected, `aria-disabled` on unavailable | 🔲 |

---

## K. TIMEZONE

| # | Test | Expected | Status |
|---|---|---|---|
| K1 | Server action called with today's Riyadh date | Accepted (not rejected as past) | 🔲 |
| K2 | Server action called with yesterday's date | Rejected as past | 🔲 |
| K3 | ICS event DTSTART has correct timezone `Asia/Riyadh` | `DTSTART;TZID=Asia/Riyadh:` prefix | 🔲 |
| K4 | ICS event has VTIMEZONE block | `BEGIN:VTIMEZONE` present in file | 🔲 |
| K5 | ICS lines max 75 chars (with folding) | No line exceeds 75 chars without continuation space | 🔲 |

---

## KNOWN GAPS (Not Fixed — No-New-Features Rule)

| Gap | Severity | When |
|---|---|---|
| Today's past time slots still shown | MEDIUM | Phase 7 / Post-launch |
| No customer cancellation flow | MEDIUM | Future feature |
| No rate limiting on server actions | MEDIUM | Before production deploy |
| `customers` and `bookings` SELECT is wide-open for all `authenticated` | MEDIUM | When admin auth added |
| No email confirmation sent | LOW | Phase 7 (notifications) |
| Staff selection not in booking flow | LOW | Future feature |
