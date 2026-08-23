-- ==============================================================================
-- PHASE 9-D.5: EMERGENCY STABILIZATION (STAFF SCHEMA & RBAC FIXES)
-- ==============================================================================

-- 1. ADD MISSING STAFF COLUMNS
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bio_ar TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;

-- Add slug as TEXT first, without the UNIQUE constraint to prevent immediate failure
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS slug TEXT;
-- In PostgreSQL, multiple NULL values in a UNIQUE column are permitted.
-- Since existing rows will have slug = NULL, creating the index is guaranteed to succeed.
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_slug ON public.staff(slug);


-- 2. FIX RLS POLICIES FOR OPERATIONAL FINANCIALS (EXPENSES, PURCHASES, SUPPLIERS)
-- Current: FOR ALL, USING role IN ('admin', 'manager')
-- Revised: FOR ALL, USING role IN ('super_admin', 'admin', 'manager')

DROP POLICY IF EXISTS "Admin and manager can manage expense_categories" ON public.expense_categories;
CREATE POLICY "SuperAdmin, Admin, and manager can manage expense_categories" ON public.expense_categories
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')));

DROP POLICY IF EXISTS "Admin and manager can manage expenses" ON public.expenses;
CREATE POLICY "SuperAdmin, Admin, and manager can manage expenses" ON public.expenses
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')));

DROP POLICY IF EXISTS "Admin and manager can manage suppliers" ON public.suppliers;
CREATE POLICY "SuperAdmin, Admin, and manager can manage suppliers" ON public.suppliers
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')));

DROP POLICY IF EXISTS "Admin and manager can manage purchases" ON public.purchases;
CREATE POLICY "SuperAdmin, Admin, and manager can manage purchases" ON public.purchases
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')));


-- 3. FIX RLS POLICIES FOR OWNER FINANCIALS (PARTNERS & PAYROLL)
-- Current: SELECT/INSERT/UPDATE for 'admin' only. DELETE is explicitly false.
-- Revised: SELECT/INSERT/UPDATE for 'super_admin' and 'admin'. DELETE explicitly false.

-- Partners
DROP POLICY IF EXISTS "Admin can view partners" ON public.partners;
DROP POLICY IF EXISTS "Admin can insert partners" ON public.partners;
DROP POLICY IF EXISTS "Admin can update partners" ON public.partners;
DROP POLICY IF EXISTS "Nobody can delete partners" ON public.partners;

CREATE POLICY "SuperAdmin and Admin can view partners" ON public.partners FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can insert partners" ON public.partners FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can update partners" ON public.partners FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "Nobody can delete partners" ON public.partners FOR DELETE USING (false);


-- Partner Withdrawals
DROP POLICY IF EXISTS "Admin can view partner withdrawals" ON public.partner_withdrawals;
DROP POLICY IF EXISTS "Admin can insert partner withdrawals" ON public.partner_withdrawals;
DROP POLICY IF EXISTS "Admin can update partner withdrawals" ON public.partner_withdrawals;
DROP POLICY IF EXISTS "Nobody can delete partner withdrawals" ON public.partner_withdrawals;

CREATE POLICY "SuperAdmin and Admin can view partner withdrawals" ON public.partner_withdrawals FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can insert partner withdrawals" ON public.partner_withdrawals FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can update partner withdrawals" ON public.partner_withdrawals FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "Nobody can delete partner withdrawals" ON public.partner_withdrawals FOR DELETE USING (false);


-- Salaries
DROP POLICY IF EXISTS "Admin can view salaries" ON public.salaries;
DROP POLICY IF EXISTS "Admin can insert salaries" ON public.salaries;
DROP POLICY IF EXISTS "Admin can update salaries" ON public.salaries;
DROP POLICY IF EXISTS "Nobody can delete salaries" ON public.salaries;

CREATE POLICY "SuperAdmin and Admin can view salaries" ON public.salaries FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can insert salaries" ON public.salaries FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can update salaries" ON public.salaries FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "Nobody can delete salaries" ON public.salaries FOR DELETE USING (false);


-- Employee Advances
DROP POLICY IF EXISTS "Admin can view employee advances" ON public.employee_advances;
DROP POLICY IF EXISTS "Admin can insert employee advances" ON public.employee_advances;
DROP POLICY IF EXISTS "Admin can update employee advances" ON public.employee_advances;
DROP POLICY IF EXISTS "Nobody can delete employee advances" ON public.employee_advances;

CREATE POLICY "SuperAdmin and Admin can view employee advances" ON public.employee_advances FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can insert employee advances" ON public.employee_advances FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "SuperAdmin and Admin can update employee advances" ON public.employee_advances FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'admin')));

CREATE POLICY "Nobody can delete employee advances" ON public.employee_advances FOR DELETE USING (false);
