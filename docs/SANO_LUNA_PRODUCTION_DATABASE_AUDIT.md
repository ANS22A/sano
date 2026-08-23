# SANO LUNA Production Database Audit

## 1. MCP Connection Verification
- **Status:** CONNECTED
- **Project:** mmzdzrnmbmgklkxxgufn
- **Mode:** READ-ONLY
- **Tools:** AVAILABLE

## 2. Production Database Verification
The production database was successfully inspected directly via the Supabase MCP tools. All findings below are based on live production data and schema.

## 3. Table/Schema Audit
All core tables exist in the `public` schema (`profiles`, `staff`, `partners`, `partner_withdrawals`, `bookings`, `sales`, `expenses`, `purchases`, `salaries`, `employee_advances`, `suppliers`, `expense_categories`, `customers`, `services`, `packages`, `package_services`). 
- Primary Keys and Foreign Keys are intact.
- RLS is explicitly enabled (`relrowsecurity = true`) on all tables.

## 4. RPC/Function Audit
Inspected `get_owner_financial_stats`. The function is marked as `SECURITY DEFINER` and correctly checks for `admin` or `super_admin` roles. However, it contains type-casting issues which are detailed in Section 7.

## 5. RLS Audit
RLS policies were successfully retrieved.
- `staff`: Public can read active staff. Admin manages staff.
- `partners` / `partner_withdrawals`: Phase 9-D.5 fixes are successfully applied; `admin` and `super_admin` have full SELECT/INSERT/UPDATE permissions.
- `bookings`: Admin manages bookings. Customers can view their own.
- `packages` / `package_services`: Admin has full management, public can view active.

## 6. Storage Audit
- **Bucket:** `sanoluna-media`
- **Finding:** The bucket `sanoluna-media` **DOES NOT EXIST** in `storage.buckets`. Therefore, there are no RLS policies for it.

## 7. Dashboard Diagnosis
**[CONFIRMED]**
The root cause of the 500 Error on the Dashboard is a PostgreSQL type-casting error inside `get_owner_financial_stats`.
- **Exact Mismatch:** The RPC compares `date` type columns directly against `text` inputs: `WHERE is_archived = false AND date >= p_start_date::text AND date <= p_end_date::text;`. 
- **Evidence:** Executing `SELECT current_date >= '2026-01-01'::text;` directly via MCP returns: `ERROR: 42883: operator does not exist: date >= text`.
- **Root Cause:** PostgreSQL does not support implicit casting from `text` to `date` for comparison operators (`>=`, `<=`) unless explicitly cast to date (e.g., `p_start_date::date`). This immediately crashes the RPC and causes PostgREST to return a 500 error.

## 8. Reports Diagnosis
**[CONFIRMED]**
The Reports page fails for the exact same reason as the Dashboard. `src/app/actions/adminReports.actions.ts` invokes `getOwnerFinancialStats()`, which executes the failing RPC and bubbles up the 500 error.

## 9. Employee Diagnosis
**[CONFIRMED]**
The `staff` table has a `UNIQUE (slug)` constraint (`staff_slug_key`). 
- **Root Cause:** When attempting to add an employee with a slug that already exists (or an empty string `""` if the UI submits it twice, since `""` is not `NULL`), PostgreSQL throws error `23505` (unique violation). 
- **Evidence:** Found constraint `staff_slug_key` mapped to `UNIQUE (slug)` in `pg_constraint`.

## 10. Partner Diagnosis
**[NOT THE CAUSE]**
The database is not the cause of any lingering Partner access issues.
- **Evidence:** The `partners` and `partner_withdrawals` RLS policies explicitly grant `SELECT`, `INSERT`, and `UPDATE` access to both `admin` and `super_admin`. The Phase 9-D.5 migration was successfully applied in production.

## 11. Booking Confirmation Diagnosis
**[NOT THE CAUSE]**
There is no database-level reason preventing a booking from being updated to `confirmed`. 
- **Evidence:** The `status` enum (`booking_status`) correctly contains `'confirmed'`. There are no database triggers on `bookings` blocking updates. The RLS policies grant full `UPDATE` access to admins and managers. 
- **Root Cause:** This is a code-level or Vercel-level issue (e.g., failure in the email notification service, unhandled promise rejections, or edge function timeouts) rather than a database failure.

## 12. Service Image Diagnosis
**[CONFIRMED]**
The Service Image Upload feature fails because the `sanoluna-media` storage bucket does not exist.
- **Evidence:** `SELECT id, name FROM storage.buckets;` only returns `business_documents`.
- **Root Cause:** Without the bucket, Supabase Storage returns a 404/400 error immediately upon upload.

## 13. Packages Diagnosis
**[CONFIRMED]**
The Packages database infrastructure is completely intact and production-ready.
- **Evidence:** Both `packages` and `package_services` tables exist with correct columns, `price_sar >= 0` checks, UUID primary keys, cascaded foreign keys, and complete Admin RLS policies. 

## 14. Code/Database Mismatches
| Feature | Page | Server Action | DB Object | Expected | Actual | Exact Mismatch |
|---------|------|---------------|-----------|----------|--------|----------------|
| Dashboard | /admin | getOwnerFinancialStats | get_owner_financial_stats (RPC) | `p_start_date` parsed as Date | `p_start_date::text` | `date >= text` throws 42883 |
| Image Upload | /admin/services | uploadServiceImage | storage.buckets | `sanoluna-media` exists | Missing | Bucket `sanoluna-media` does not exist |

## 15. Confirmed Root Causes
1. **Dashboard/Reports 500:** PostgreSQL Error 42883 (`operator does not exist: date >= text`) in `get_owner_financial_stats`.
2. **Employee Add Failure:** PostgreSQL Error 23505 due to `UNIQUE (slug)` constraint violation on `staff`.
3. **Image Upload Failure:** `sanoluna-media` bucket is missing in production.

## 16. Problems that are NOT database-related
- **Booking Confirmations:** The database schema and RLS policies perfectly allow status updates to `'confirmed'`. The failure is likely caused by the external Resend API, Edge function timeouts, or application logic.
- **Partner Access:** RLS is correctly configured. If issues persist, it is a UI state or session caching issue.

## 17. Unknown issues requiring Vercel logs
- Exact stack traces for the Booking Confirmation failure (to verify if Resend email notifications are throwing unhandled exceptions).

## 18. Recommended Fixes
1. **RPC Fix:** Update `get_owner_financial_stats` to remove `::text` casting and cast inputs to `::date` (e.g. `p_start_date::date`).
2. **Storage Fix:** Create the `sanoluna-media` bucket and apply RLS policies granting admins/managers INSERT/UPDATE/DELETE access, and public SELECT access.
3. **Code Fix (Employees):** Enhance form validation in `adminStaff.actions.ts` to check for existing slugs before inserting, returning a user-friendly error instead of throwing a 500.

## 19. Required SQL Migrations
- Recreate `get_owner_financial_stats` with corrected date type comparisons.
- Create `sanoluna-media` storage bucket and attach its `storage.objects` RLS policies.

## 20. Required Code Changes
- Add explicit duplicate slug checking in `adminStaff.actions.ts`.

## 21. Priority Order
1. Fix `get_owner_financial_stats` (Restores Dashboard & Reports).
2. Create `sanoluna-media` bucket (Restores image uploads).
3. Implement application-level slug validation for Employees.
4. Investigate Vercel logs for Booking Confirmation email failures.

## 22. Performance Assessment
**[PERFORMANCE RISK ONLY]**
`getAdminReports()` in `src/app/actions/adminReports.actions.ts` fetches raw rows for `bookings` across the entire date range into Node.js to execute a `.reduce()` sum. This is not currently causing the 500 errors, but is highly inefficient and should eventually be moved to a database aggregate.
