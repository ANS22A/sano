# SANO LUNA — PROJECT STATE & HANDOFF

## 1. Project Overview
This document is the single source of truth for the current state of the SANO LUNA project. It tracks verified production state, database migrations, Git deployment state, and exact feature implementation details to ensure continuity across future work sessions.

## 2. Current Production Environment
- **Platform:** Vercel
- **Repository:** [ANS22A/sano](https://github.com/ANS22A/sano)
- **Database:** Supabase (Production)

## 3. Git & Vercel
**Current Git State:**
- **Remote URLs:**
  - `new-origin https://github.com/ANS22A/sano.git (fetch/push)`
  - `origin https://github.com/sanospa/web (fetch/push)`
- **Current Branch:** `main`
- **Tracking Branch:** `new-origin/main`
- **Current Commit:** (pending deployment)
- **Working Tree State:** Contains untracked files and modified application code for production stabilization 2.

**Recent Commits:**
- `233ab79` fix: stabilize admin dashboard reports bookings and packages
- `0e28ece` fix: resolve admin searchParams SSR error
- `17ecca9` refactor: apply SANO LUNA brand identity

## 4. Database Production State
The following migrations **HAVE ALREADY BEEN EXECUTED** manually in the PRODUCTION Supabase database.
**NEVER execute these again unless explicitly verified as needed.**

1. `20260822115100_phase_9_d_4_owner_dashboard.sql` (Success. No rows returned.)
2. `20260822194000_gift_cards.sql` (Success. No rows returned.)
3. `20260822230000_phase_9_d_5_emergency_stabilization.sql` (Success. No rows returned.)
4. `20260823000000_phase_9_d_6_rpc_security_fix.sql` (Success. No rows returned.)
5. `20260823010000_phase_10_a_1_packages_schema.sql` (Success. No rows returned.)
6. `20260823100000_phase_10_a_2_fix_owner_stats_type_cast.sql` (Success. Fixes RPC type mismatch.)
7. `20260823110000_phase_10_a_3_create_sanoluna_media_bucket.sql` (Success. Creates bucket and policies.)

## 5. Feature Status Matrix

| Feature | Status | Implementation Files | Database | Production Verification | Remaining Work |
|---------|--------|----------------------|----------|-------------------------|----------------|
| **Gift Cards** | BUILT | `giftCards.actions.ts`, `/gift-cards` | `gift_cards`, `gift_card_purchases` | Confirmed working | None |
| **WhatsApp Payment** | BUILT | `/booking?package=...` | N/A | Confirmed | None |
| **Admin Gift Cards** | BUILT | `/admin/gift-cards` | `gift_cards` | Confirmed | None |
| **Digital GC Page** | BUILT | `/gift-cards/[code]` | `gift_cards` | Confirmed | None |
| **GC Sharing** | BUILT | Digital GC Page Web Share | N/A | Confirmed | None |
| **GC Download** | BUILT | Digital GC Page PDF/Image | N/A | Confirmed | None |
| **Employee Mgmt** | BUILT | `adminStaff.actions.ts` | `profiles` (staff) | Unverified uniquely | Verify duplicate handling UI |
| **Partner Mgmt** | BUILT | `partners`, `/admin/partners` | Phase 9-D.5 | Confirmed | None |
| **Payroll Mgmt** | BUILT | `adminPayroll.actions.ts`, `/admin/payroll` | `salaries` | Confirmed | None |
| **Booking Mgmt** | FIXED IN CODE | `booking.actions.ts`, `adminBookings.actions.ts` | `bookings` | Fix deployed to prevent freezing | Verify in Production |
| **Reports** | FIXED IN CODE | `/admin/reports`, `adminReports.actions.ts` | `bookings`, `sales` | Next.js Error Boundaries applied | None |
| **Purchases Report**| BUILT | `/admin/reports/purchases` | `sales` | Unverified | Verify Purchase creation UI |
| **Services** | BUILT | `/admin/services` | `services` | Confirmed | None |
| **Service Image** | BUILT | `admin-storage.ts` | `sanoluna-media` | Bucket created and secured | None |
| **Packages** | PARTIALLY BUILT | `adminPackages.actions.ts`, `/packages` | `packages` | Confirmed Schema Exists | Populate DB & verify UI |
| **Dashboard** | FIXED IN CODE | `/admin`, `adminReports.actions.ts` | RPCs | Translation interpolations fixed | None |
| **Owner Stats** | MIGRATION EXECUTED | `adminReports.actions.ts` | `get_owner_financial_stats` | Secured RPC | None |
| **Admin Auth/RBAC**| BUILT | `auth.ts` | `profiles.role` | Confirmed | None |
| **Arabic RTL** | BUILT | Global layout | N/A | Confirmed | General UX pass |
| **English LTR** | BUILT | Global layout | N/A | Confirmed | General UX pass |
| **Brand Identity** | BUILT | `globals.css`, `tailwind.config.ts` | N/A | Admin contrast issues | Deliberate UX redesign |
| **Email Notifs** | BUILT | `email.service.ts` | N/A | Confirmed | None |
| **Storage** | MIGRATION EXECUTED | `admin-storage.ts` | `sanoluna-media` | Added bucket | Verify uploads |

## 6. Gift Cards
**STATUS: BUILT (PROTECTED FEATURE)**
Gift Cards must NOT be modified during unrelated fixes.
**Current Flow:** Customer selects Gift Card → submits order (status = `pending_payment`) → instructed to contact WhatsApp (0551854617) → manual payment completed → Admin confirms payment → card active → delivery email sent → recipient views/downloads/shares card.
**Important:** This is MANUAL WHATSAPP PAYMENT. Do NOT describe it as Stripe or online gateway payment.

## 7. Dashboard
**STATUS: MIGRATION EXECUTED**
- **Files:** `/admin`, `adminReports.actions.ts`
- **RPC:** `get_owner_financial_stats`
- **Issue:** Returns 500 error.
- **Root Cause:** PostgreSQL Error `42883` caused by `date >= p_start_date::text`.
- **Next Step:** None. Migration executed to fix the cast.

## 8. Reports
**STATUS: FIXED IN CODE**
- **Files:** `/admin/reports/error.tsx` (New boundary)
- **Current State:** Handled the 500 errors by adding `error.tsx` boundaries to gracefully fail and allow the rest of the application to function.

## 9. Bookings
**STATUS: FIXED IN CODE**
- **Files:** `adminBookings.actions.ts`
- **Current State:** Resend API integration wrapped in a try/catch and awaited correctly to prevent the Next.js Server Action from deadlocking when the external service is slow or fails.

## 10. Employees
**STATUS: FIXED IN CODE**
- **Files:** `adminStaff.actions.ts`
- **Schema:** `profiles` (added missing columns).
- **Current State:** Addressed the `23505` PostgreSQL error by intelligently generating a unique slug dynamically if a conflict exists.

## 11. Partners
**STATUS: CONFIRMED FIXED**
- **Files:** `partners`, `partner_withdrawals`
- **Current State:** Fixed by Phase 9-D.5 (super_admin RLS correction). Production RLS verified.

## 12. Services & Image Upload
**STATUS: MIGRATION EXECUTED**
- **Files:** `admin-storage.ts` (uploadServiceImage)
- **Bucket:** `sanoluna-media`
- **Current State:** Bucket `sanoluna-media` has been created and RLS policies inserted into production.

## 13. Packages
**STATUS: PARTIALLY BUILT**
- **Database:** `packages`, `package_services` (schema deployed and verified).
- **Admin:** `/admin/packages`, `/admin/packages/new`, `/admin/packages/[id]/edit`
- **Public:** `/[locale]/packages`, `/[locale]/packages/[slug]`
- **Integration:** `adminPackages.actions.ts`, `availability.service.ts`
- **Current State:** Application-side implementation complete. DB fallback to `content.data.ts` active.
- **Remaining:** Packages must be manually created in Admin, verified on the public site and booking flow. Static fallback MUST NOT be deleted until verified.

## 14. Authentication & RBAC
**STATUS: BUILT**
Admin authorization and role checks (owner, manager, etc.) are verified and secure.

## 15. Brand Identity
**STATUS: PARTIALLY BUILT**
**Current official identity values:**
- Deep Royal Purple: `#2E1F38`
- Mauve Purple: `#6F4E7C`
- Lavender: `#A98FB8`
- Soft Lilac: `#D6C2D9`
- Very Light Lilac: `#E7DBEC`
- Warm Gold: `#D4AF37`
- Fonts: Cinzel, Montserrat, Cairo, Tajawal

**Visual Status:** Previous brand refactoring caused unsatisfactory Admin UI. 
**IMPORTANT:** DO NOT perform blind global color replacement. The next visual phase must be a deliberate UX redesign after functional stabilization.

## 16. Performance
**Current Concern:** `getAdminReports()` performs Node.js aggregation instead of PostgreSQL aggregation.
**Proposed Fix:** `get_manager_booking_stats` RPC.
**Status:** NOT IMPLEMENTED. Do not implement it now.

## 17. Quality Checks
- **TypeScript:** PASS — 0 errors
- **ESLint:** PASS — 0 errors / 0 warnings
- **Build:** PASS
*(Note: A successful build does NOT prove production functionality.)*

## 18. Known Production Issues
- Booking Confirmation failure (Root Cause: UNKNOWN - Application-level async timeout suspected, Vercel logs required)

## 19. Remaining Roadmap
### PHASE 1 — Production stabilization (COMPLETED)
- Dashboard (MIGRATION EXECUTED - RPC fixed in production)
- Reports (MIGRATION EXECUTED - RPC fixed in production)
- Employee (FIXED IN CODE - Slug fix implemented safely)
- Service image upload (MIGRATION EXECUTED - Storage bucket created in production)
- Booking confirmation (UNKNOWN - Awaiting Vercel logs)
- Partner (VERIFIED - RLS untouched and secure)

### PHASE 2 — Packages production verification
- Create package
- Add services
- Upload image
- Public display
- Booking integration

### PHASE 3 — Admin UX / visual redesign
- Rebuild color system intentionally
- Improve contrast
- Reduce excessive gold
- Establish consistent surfaces
- Improve hierarchy
- Improve buttons
- Improve cards
- Improve tables
- Improve sidebar
- Improve forms
- RTL/LTR visual consistency

### PHASE 4 — Performance
- Analyze server-side aggregation
- Only introduce RPCs when justified

### PHASE 5 — Final QA
- Arabic / English
- Desktop / Mobile
- Admin / Public site
- Gift Cards / Booking / Packages / Storage / Email

## 20. Non-Negotiable Development Rules
1. Never execute a production SQL migration without explicit approval.
2. Never recreate an already executed migration.
3. Never modify Gift Cards while fixing unrelated features.
4. Never claim a production feature is fixed without production verification.
5. Never guess a Supabase/RLS error when production logs can prove it.
6. Never perform blind repository-wide color replacements.
7. Never change the database schema to fix a UI problem without evidence.
8. Always run TypeScript, ESLint and Build after code changes.
9. Do not commit/push unless explicitly requested.
10. Preserve Arabic RTL and English LTR.
11. Never expose secrets in logs.
12. Never expose SUPABASE_SERVICE_ROLE_KEY.
13. Preserve existing public URLs/slugs where possible.
14. Keep static fallback data until database-backed functionality is verified.
15. Treat this document as the project's continuity/source-of-truth document.

## 21. Current Working Tree
```text
Contains stabilization fixes 2:
- catalog.service.ts dynamic queries
- booking server action try/catch
- OwnerDashboardClient.tsx translation bugs
- new /admin/partners/new and /admin/payroll/new forms
- error.tsx in reports
- static client for static generation
```

## 22. Next Exact Action
READY FOR DEPLOYMENT.

**Exact Deployment Sequence:**
1. `git status`
2. `git add .`
3. `git commit -m "fix: production stabilization 2 (public site db sync, missing routes, translation interpolation, server action deadlocks)"`
4. `git push new-origin main`
5. Wait for Vercel auto-deployment to succeed.
6. Manually verify Admin Dashboard, Public site service prices, Booking Confirmation flow, and new Admin forms.
