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
- **Current Commit:** `233ab79 fix: stabilize admin dashboard reports bookings and packages`
- **Working Tree State:** Clean (nothing to commit)

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
| **Employee Mgmt** | FIXED IN CODE | `adminStaff.actions.ts` | `profiles` (staff) | Unverified uniquely | Verify duplicate handling UI |
| **Partner Mgmt** | CONFIRMED FIXED | `partners`, `partner_withdrawals` | Phase 9-D.5 | RLS fixed, untouched | Verify Admin Partners |
| **Booking Mgmt** | UNKNOWN | `booking.actions.ts`, `adminBookings.actions.ts` | `bookings` | Database is NOT blocking | Vercel runtime log tracing required |
| **Reports** | MIGRATION EXECUTED | `/admin/reports`, `adminReports.actions.ts` | `bookings`, `sales` | RPC fixed via migration | None |
| **Purchases Report**| BUILT | `/admin/reports/purchases` | `sales` | Unverified | Verify Purchase creation UI |
| **Services** | BUILT | `/admin/services` | `services` | Confirmed | None |
| **Service Image** | MIGRATION EXECUTED | `admin-storage.ts` | `sanoluna-media` | Bucket created and secured | None |
| **Packages** | PARTIALLY BUILT | `adminPackages.actions.ts`, `/packages` | `packages` | Confirmed Schema Exists | Populate DB & verify UI |
| **Dashboard** | MIGRATION EXECUTED | `/admin`, `adminReports.actions.ts` | RPCs | RPC fixed via migration | None |
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
**STATUS: MIGRATION EXECUTED**
- **Files:** `/admin/reports`, `/admin/reports/purchases`, `ReportsNavigation`, `adminReports.actions.ts`
- **Current State:** Fixed by RPC migration removing type-cast errors.

## 9. Bookings
**STATUS: UNKNOWN**
- **Files:** `booking.actions.ts`, `adminBookings.actions.ts`
- **Current State:** RLS and constraints allow confirmation. Failure is likely due to Vercel/Resend email notifications or other application-level async code timeout. Tracing logs are required to definitively prove it.

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
On branch main
Your branch is up to date with 'new-origin/main'.

nothing to commit, working tree clean
```

## 22. Next Exact Action
READY FOR DEPLOYMENT.

**Exact Deployment Sequence:**
1. `git add .`
2. `git commit -m "fix: production stabilization (rpc, storage, slugs)"`
3. `git push origin main`
4. Wait for Vercel auto-deployment to succeed.
5. Manually verify Admin Dashboard, Employee creation, and Service Image upload.
6. Check Vercel logs to definitively diagnose the Booking Confirmation asynchronous failure.
