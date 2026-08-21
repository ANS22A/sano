-- ==============================================================================
-- PHASE 9-D.3: PARTNERS, EMPLOYEE SALARIES & ADVANCES SCHEMA MIGRATION
-- ==============================================================================

-- 1. Extend existing staff table with employment & financial metadata
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS base_salary NUMERIC(10,2) DEFAULT 0.00 CHECK (base_salary >= 0);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS salary_basis VARCHAR DEFAULT 'monthly' CHECK (salary_basis IN ('monthly', 'hourly', 'commission'));
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS employment_start_date DATE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS national_id VARCHAR;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS iban VARCHAR;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS employment_status VARCHAR DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'terminated', 'resigned'));

-- 2. Partners Table (Owners & Equity Partners)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    phone VARCHAR,
    email VARCHAR,
    ownership_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Partner Withdrawals Table (Equity Drawings - Excluded from OPEX)
CREATE TABLE IF NOT EXISTS public.partner_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR UNIQUE NOT NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    payment_method VARCHAR NOT NULL CHECK (payment_method IN ('bank_transfer', 'cash', 'mada', 'credit_card', 'other')),
    status VARCHAR NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'void')),
    notes TEXT,
    attachment_url VARCHAR,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Salaries / Payroll Records Table (Operating Payroll Expense)
CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR UNIQUE NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    month VARCHAR(7) NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
    gross_salary NUMERIC(10,2) NOT NULL CHECK (gross_salary >= 0),
    advances_deducted NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (advances_deducted >= 0),
    other_deductions NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (other_deductions >= 0),
    bonuses NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (bonuses >= 0),
    net_salary NUMERIC(10,2) NOT NULL CHECK (net_salary >= 0),
    payment_status VARCHAR NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'void')),
    payment_date DATE,
    payment_method VARCHAR CHECK (payment_method IN ('bank_transfer', 'cash', 'mada', 'credit_card', 'other')),
    notes TEXT,
    attachment_url VARCHAR,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Employee Advances Table
CREATE TABLE IF NOT EXISTS public.employee_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR UNIQUE NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    payment_method VARCHAR NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'mada', 'credit_card', 'other')),
    status VARCHAR NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'settled', 'void')),
    salary_id UUID REFERENCES public.salaries(id) ON DELETE SET NULL,
    notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes & Integrity Constraints
CREATE INDEX IF NOT EXISTS idx_partners_created_by ON public.partners(created_by);
CREATE INDEX IF NOT EXISTS idx_partner_withdrawals_partner_id ON public.partner_withdrawals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_withdrawals_date ON public.partner_withdrawals(date);
CREATE INDEX IF NOT EXISTS idx_partner_withdrawals_created_by ON public.partner_withdrawals(created_by);

CREATE INDEX IF NOT EXISTS idx_salaries_staff_id ON public.salaries(staff_id);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON public.salaries(month);
CREATE INDEX IF NOT EXISTS idx_salaries_payment_status ON public.salaries(payment_status);
CREATE INDEX IF NOT EXISTS idx_salaries_created_by ON public.salaries(created_by);

CREATE INDEX IF NOT EXISTS idx_employee_advances_staff_id ON public.employee_advances(staff_id);
CREATE INDEX IF NOT EXISTS idx_employee_advances_salary_id ON public.employee_advances(salary_id);
CREATE INDEX IF NOT EXISTS idx_employee_advances_status ON public.employee_advances(status);
CREATE INDEX IF NOT EXISTS idx_employee_advances_created_by ON public.employee_advances(created_by);

-- Partial Unique Index: Prevent duplicate active salary records for the same employee in the same month
CREATE UNIQUE INDEX IF NOT EXISTS idx_salaries_active_month 
ON public.salaries (staff_id, month) 
WHERE (is_archived = false AND payment_status != 'void');

-- 7. Enable Row Level Security
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_advances ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (Owner / Admin Access Only)

-- Partners
DROP POLICY IF EXISTS "Admin can view partners" ON public.partners;
DROP POLICY IF EXISTS "Admin can insert partners" ON public.partners;
DROP POLICY IF EXISTS "Admin can update partners" ON public.partners;
DROP POLICY IF EXISTS "Nobody can delete partners" ON public.partners;

CREATE POLICY "Admin can view partners" ON public.partners FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can insert partners" ON public.partners FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can update partners" ON public.partners FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Nobody can delete partners" ON public.partners FOR DELETE 
USING (false);

-- Partner Withdrawals
DROP POLICY IF EXISTS "Admin can view partner withdrawals" ON public.partner_withdrawals;
DROP POLICY IF EXISTS "Admin can insert partner withdrawals" ON public.partner_withdrawals;
DROP POLICY IF EXISTS "Admin can update partner withdrawals" ON public.partner_withdrawals;
DROP POLICY IF EXISTS "Nobody can delete partner withdrawals" ON public.partner_withdrawals;

CREATE POLICY "Admin can view partner withdrawals" ON public.partner_withdrawals FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can insert partner withdrawals" ON public.partner_withdrawals FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can update partner withdrawals" ON public.partner_withdrawals FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Nobody can delete partner withdrawals" ON public.partner_withdrawals FOR DELETE 
USING (false);

-- Salaries
DROP POLICY IF EXISTS "Admin can view salaries" ON public.salaries;
DROP POLICY IF EXISTS "Admin can insert salaries" ON public.salaries;
DROP POLICY IF EXISTS "Admin can update salaries" ON public.salaries;
DROP POLICY IF EXISTS "Nobody can delete salaries" ON public.salaries;

CREATE POLICY "Admin can view salaries" ON public.salaries FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can insert salaries" ON public.salaries FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can update salaries" ON public.salaries FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Nobody can delete salaries" ON public.salaries FOR DELETE 
USING (false);

-- Employee Advances
DROP POLICY IF EXISTS "Admin can view employee advances" ON public.employee_advances;
DROP POLICY IF EXISTS "Admin can insert employee advances" ON public.employee_advances;
DROP POLICY IF EXISTS "Admin can update employee advances" ON public.employee_advances;
DROP POLICY IF EXISTS "Nobody can delete employee advances" ON public.employee_advances;

CREATE POLICY "Admin can view employee advances" ON public.employee_advances FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can insert employee advances" ON public.employee_advances FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin can update employee advances" ON public.employee_advances FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Nobody can delete employee advances" ON public.employee_advances FOR DELETE 
USING (false);
