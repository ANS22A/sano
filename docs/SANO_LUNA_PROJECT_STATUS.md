# SANO LUNA — Master Project State & Continuation Document

Last Updated:
2026-08-21

Project:
SANO LUNA

Arabic:
سانو لونا

Location:
Jeddah, Saudi Arabia

Branch:
Jeddah Branch

Status:
PRE-PRODUCTION / FINAL BUILD

==================================================
1. PROJECT OVERVIEW
==================================================
SANO LUNA is a luxury wellness and spa destination blending ancient wisdom with modern care, offering treatments directly at the customer's location.
The platform consists of:
- Public website: Showcase services, packages, team, and brand philosophy.
- Online booking system: Allows users to book appointments with integrated availability logic.
- Admin dashboard: Internal tool to manage bookings, services, staff, customers, locations, blackout dates, and media.

==================================================
2. TECHNOLOGY STACK
==================================================
- Next.js: 16.3.1 (App Router)
- React: 19.2.8
- TypeScript: ^5.x
- Tailwind CSS: ^4.x
- Supabase (Database & Auth & Storage): `@supabase/supabase-js` ^2.112.3, `@supabase/ssr` ^0.12.4
- PostgreSQL (via Supabase)
- Server Actions for mutations
- Zod: ^4.4.3
- Resend: ^6.21.0
- Upstash (Redis & Ratelimit): `@upstash/ratelimit` ^2.0.8, `@upstash/redis` ^1.38.2
- next/image for optimized images
- Framer Motion: ^13.1.0
- GSAP: ^3.15.0
- Internationalization: `next-intl` ^4.13.7

==================================================
3. ARCHITECTURE
==================================================
Public App -> Next.js App Router -> Server Components / Client Components -> Server Actions -> Supabase

- Server-side validation: Zod schemas validate all inputs before DB operations.
- Authentication: Supabase Auth (SSR) configured for Admin dashboard.
- Authorization: Role-based Access Control (RBAC) requires 'manager' or 'admin' roles for admin actions.
- RLS: Supabase Row Level Security ensures data protection on client queries.
- Service-role usage: Server Actions use the service-role key strictly for elevated operations (e.g., storage uploads, bypassing RLS for admin).
- Public read architecture: Cached Next.js server components fetch data directly via Supabase client.
- Admin mutation architecture: Form actions -> Zod -> Server Actions -> Supabase.

==================================================
4. PUBLIC ROUTES
==================================================
| Route | Arabic | English | Status | Data Source | Notes |
|---|---|---|---|---|---|
| `/[locale]` | الرئيسية | Home | Complete | DB/Static | Fully localized |
| `/[locale]/services` | الخدمات | Services | Complete | DB | Fetches active services |
| `/[locale]/services/[slug]` | تفاصيل الخدمة | Service Details | Complete | DB | Service specifics |
| `/[locale]/packages` | الباقات | Packages | Complete | Static | `content.data.ts` |
| `/[locale]/packages/[slug]` | تفاصيل الباقة | Package Details | Complete | Static | `content.data.ts` |
| `/[locale]/booking` | الحجز | Booking | Complete | DB/Static | Booking engine |
| `/[locale]/team` | فريقنا | Our Team | Complete | DB | Fetches staff |
| `/[locale]/about` | من نحن | About | Complete | Static | `content.data.ts` |
| `/[locale]/contact` | اتصل بنا | Contact | Complete | Static | `site.config.ts` |
| `/[locale]/faq` | الأسئلة الشائعة | FAQ | Complete | Static | `content.data.ts` |

**Intentionally Hidden/Removed Routes:**
- `/gallery`: Hidden because authentic photography is unavailable.
- `/reviews`: Hidden because authentic reviews are unavailable.
- `/policies`: Hidden pending official policy content.

==================================================
5. ADMIN ROUTES
==================================================
- `/admin/login`: Admin authentication entry.
- `/admin`: Dashboard overview.
- `/admin/bookings`: List of all bookings.
- `/admin/bookings/[id]`: Detailed view of a booking.
- `/admin/calendar`: Calendar view of bookings.
- `/admin/services`: Service listing.
- `/admin/services/new`: Create a new service.
- `/admin/services/[id]/edit`: Edit a service.
- `/admin/customers`: Customer listing.
- `/admin/customers/[id]`: Customer details.
- `/admin/staff`: Staff management.
- `/admin/staff/[id]/availability`: Staff schedule management.
- `/admin/locations`: Location management.
- `/admin/reports`: Business reports.
- `/admin/settings`: General settings.
- `/admin/settings/business-hours`: Global operating hours.
- `/admin/settings/blackout-dates`: Blocked dates for all staff/locations.

**Status:** Functionally complete, requires 'manager' RBAC, full CRUD capabilities.

==================================================
6. BOOKING SYSTEM
==================================================
- Service selection: Users select from active DB services.
- Location selection: Defaults to primary location.
- Date selection: Constrained by blackout dates and business hours.
- Time slot generation: Dynamic generation filtering out past slots (respects Asia/Riyadh).
- Staff availability: Checks individual staff assignments.
- Double-booking protection: Server-side validation during transaction.
- Server-side pricing/duration: Validated securely.
- Rate limiting: Prevents spam.
- Emails: Async Resend dispatch on creation, cancellation, reschedule.

**Files:** `src/services/availability.service.ts`, `src/services/booking.service.ts`, `src/app/actions/booking.actions.ts`.
**IMPORTANT:** The booking architecture must not be casually rewritten.

==================================================
7. RATE LIMITING
==================================================
- Provider: Upstash Redis
- Packages: `@upstash/ratelimit`, `@upstash/redis`
- `createBooking`: 3 requests / 10 minutes / IP
- `getBookingSlots`: 30 requests / 1 minute / IP
- Fail-open behavior: If Redis is down, it bypasses rate limit rather than blocking users.
- Env variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

==================================================
8. EMAIL NOTIFICATIONS
==================================================
- Provider: Resend
- Events: Booking confirmation, Cancellation, Reschedule.
- Env variables: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Server-only execution.
- Asynchronous dispatch.
- Email failure must not break booking transactions.

==================================================
9. SUPABASE STORAGE
==================================================
- Bucket: `sanoluna-media`
- Public read: YES
- Anonymous upload: NO
- Admin upload: Server Action only
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`
- Maximum size: 5 MB
- SVG: BLOCKED
- Paths: `services/`, `staff/`

==================================================
10. ADMIN MEDIA MANAGEMENT
==================================================
- Service/Staff image upload: Managed via `admin-storage.ts`.
- Replace behavior: Overwrites existing file or generates new hash.
- Validation: MIME and Size checks server-side.
- RBAC: Requires manager auth.

==================================================
11. ADMIN CRUD
==================================================
| Entity | Create | Read | Update | Delete | Archive | Audit | RBAC |
|---|---|---|---|---|---|---|---|
| Customers | Yes | Yes | Yes | No | Yes | Yes | Manager |
| Staff | Yes | Yes | Yes | No | Yes | Yes | Manager |
| Locations | Yes | Yes | Yes | No | Yes | Yes | Manager |
| Services | Yes | Yes | Yes | No | Yes | Yes | Manager |
| Bookings | Yes | Yes | Yes | No | Yes | Yes | Manager |

*Intentional deletion restrictions: Deletions are typically soft-deletes/archives to preserve historical integrity.*

==================================================
12. DATABASE ARCHITECTURE
==================================================
Tables include: `locations`, `bookings`, `business_hours`, `blackout_dates`, `staff`, `staff_availability`, `services`, `customers`.

**IMPORTANT: Unresolved Migration Issue**
- Current location ID: `riyadh-main`
- Target location ID: `jeddah-main`
- Foreign-key relationships exist on bookings, business_hours, blackout_dates, staff, staff_availability.
- Current repository does not contain the original schema migrations.
- `ON UPDATE CASCADE` behavior has not been verified.
- Local Supabase credentials are currently unavailable (`placeholder.supabase.co`).
- Migration must NOT be executed blindly.

==================================================
13. CURRENT BUSINESS INFORMATION
==================================================
Official: SANO LUNA (سانو لونا)
Saudi Arabia, Jeddah, Jeddah Branch
Operating days: Every day
Operating duration: Approximately 12 hours/day
Customer service: 24/7
*Exact opening and closing appointment hours are NOT yet finalized. Do not invent them.*

==================================================
14. OFFICIAL BRAND IDENTITY
==================================================
Deep Royal Purple: `#2E1F38`
Mauve Purple: `#6F4E7C`
Lavender: `#A98FB8`
Soft Pink Mauve: `#D6C2D9`
Very Light Lilac: `#E7DBEC`
Warm Gold: `#D4AF37`

Deep purple is the anchor, light lilac/mauve for breathing room, gold as restrained luxury accent. Avoid turning into a dark purple SaaS aesthetic.

==================================================
15. TYPOGRAPHY
==================================================
English: Cinzel (Brand/major headings), Montserrat (Body/UI/prices)
Arabic: Tajawal (Headings), Cairo (Body)

==================================================
16. DESIGN PHILOSOPHY
==================================================
Luxury, Feminine, Soft, Elegant.

==================================================
17. PUBLIC MEDIA
==================================================
- Services/Staff: Database-driven
- Packages: Static `content.data.ts`
- Gallery/Testimonials: Hidden (authentic content unavailable)
*Never invent testimonials, reviews, gallery images, staff profiles, or business claims.*

==================================================
18. SECURITY
==================================================
- RBAC, RLS, Server Actions.
- Service-role isolation.
- Server-only utilities.
- Input/Upload validation.
- Rate limiting.
- Email secret protection.
- Security headers.
*Explicitly document that service-role keys must NEVER enter client-side code.*

==================================================
19. INTERNATIONALIZATION
==================================================
Languages: Arabic (RTL), English (LTR).
Translation architecture: `next-intl`.
Source files: `messages/ar.json`, `messages/en.json`.

==================================================
20. CURRENT PRODUCTION BLOCKERS
==================================================
[ ] Final Jeddah database location migration
[ ] Real phone number
[ ] Real WhatsApp number
[ ] Real email
[ ] Real Instagram
[ ] Real Facebook
[ ] Real TikTok
[ ] Real Google Maps/address
[ ] Exact appointment operating hours
[ ] Production domain
[ ] Production Supabase environment variables
[ ] Production Upstash variables
[ ] Production Resend variables
[ ] Final media verification
[ ] Final full QA

==================================================
21. KNOWN PLACEHOLDERS
==================================================
- `riyadh-main`: `locations.data.ts`. Fallback location ID. Must be migrated safely.
- `+966500000000`: `CustomerFormDialog.tsx`, `locations.data.ts`. Placeholder. Must be removed before launch.
- `+966 5X XXX XXXX`: `DetailsStep.tsx`. UI placeholder. Should be replaced with actual format.
- `hello@sanoluna.com`: `messages/en.json`. Placeholder email.
- `https://sanoluna.com`: `site.config.ts`. Placeholder domain.

==================================================
22. COMPLETED PHASES
==================================================
- Phase 7D: Customer Management
- Phase 7D-B: Staff Management
- Phase 7D-C: Location Management
- Phase 7E: Production Content / Business Information
- Phase 7F: Architecture / Services / Packages / Media audit
- Phase 7G: Availability / Security
- Phase 7H-A: Rate Limiting
- Phase 7H-B: Email Notifications
- Phase 7H-C: Production readiness audit
- Phase 7I-A: Supabase Storage Foundation
- Phase 7I-B: Admin Media Upload UI
- Phase 7I-C: Public Staff & Package Media
- Phase 7I-D: Gallery / Testimonials cleanup
- Phase 8-C: Visual / UX / Responsive audit
- Phase 8-D: Official Brand Identity
- Phase 8-F: Public Website Completion & Navigation Cleanup
- Phase 8-G: Business Data Injection (CURRENTLY BLOCKED / NOT COMPLETED)

==================================================
23. REMAINING ROADMAP
==================================================
- Phase 8-G: Production Business Data Injection
- Phase 8-H: Full Admin + Public Functional Audit
- Phase 8-I: End-to-End QA
- Phase 8-J: Security / Performance / SEO / Accessibility Audit
- Phase 8-K: Production Environment Configuration
- Phase 8-L: Final Deployment
*Do NOT recommend deployment until all previous phases are complete.*

==================================================
24. NON-NEGOTIABLE RULES
==================================================
## DEVELOPMENT SAFETY RULES
1. Never invent business information.
2. Never invent testimonials.
3. Never invent reviews.
4. Never expose service-role keys.
5. Never modify booking architecture without explicit approval.
6. Never weaken RLS.
7. Never weaken RBAC.
8. Never create fake customer-facing contact information.
9. Never perform destructive database migrations without verifying FK behavior.
10. Never deploy before final QA.
11. Never replace Asia/Riyadh merely because the branch is Jeddah; it is a valid KSA timezone identifier.
12. Never add database tables merely for convenience.
13. Preserve historical booking data.
14. Keep Arabic/English parity.
15. Keep RTL/LTR parity.
16. Maintain the official SANO LUNA brand identity.

==================================================
25. CONTINUATION INSTRUCTIONS FOR FUTURE AI
==================================================
## HOW TO CONTINUE THIS PROJECT
1. Read this file first.
2. Inspect the current repository before changing anything.
3. Never assume the conversation history is available.
4. Verify every status against the codebase.
5. Continue from the first incomplete phase.
6. Do not repeat completed phases unnecessarily.
7. Follow all STOP CONDITIONS.
8. Ask for missing real business information instead of guessing.
9. Do not deploy until the final deployment phase is explicitly approved.

==================================================
26. FINAL CURRENT STATUS
==================================================
PUBLIC WEBSITE:
READY FOR FINAL QA

ADMIN:
FUNCTIONALLY COMPLETE — FINAL QA REQUIRED

BOOKING:
PRODUCTION-READY ARCHITECTURE — FINAL E2E TEST REQUIRED

MEDIA:
FOUNDATION + ADMIN UPLOAD COMPLETE

BRAND:
OFFICIAL IDENTITY IMPLEMENTED

RATE LIMITING:
IMPLEMENTED

EMAIL:
IMPLEMENTED

DATABASE:
REQUIRES FINAL JEDDAH LOCATION DATA MIGRATION

BUSINESS DATA:
INCOMPLETE

PRODUCTION ENVIRONMENT:
NOT CONFIGURED

DEPLOYMENT:
NOT STARTED

OVERALL:
PRE-PRODUCTION — DO NOT DEPLOY
