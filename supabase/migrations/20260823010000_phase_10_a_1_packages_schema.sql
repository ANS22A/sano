-- ==============================================================================
-- PHASE 10-A.1: PACKAGES INFRASTRUCTURE
-- ==============================================================================

-- 1. Create Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR UNIQUE NOT NULL,
    name_en VARCHAR NOT NULL,
    name_ar VARCHAR NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price_sar NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price_sar >= 0),
    total_duration_minutes INT NOT NULL DEFAULT 0 CHECK (total_duration_minutes >= 0),
    image_url VARCHAR,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Package Services Join Table
CREATE TABLE IF NOT EXISTS public.package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    sequence_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, service_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_packages_slug ON public.packages(slug);
CREATE INDEX IF NOT EXISTS idx_packages_active_order ON public.packages(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_package_services_package_id ON public.package_services(package_id);

-- 4. Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Packages
DROP POLICY IF EXISTS "Public can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can view all packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can update packages" ON public.packages;

CREATE POLICY "Public can view active packages" ON public.packages FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can view all packages" ON public.packages FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Admin can insert packages" ON public.packages FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Admin can update packages" ON public.packages FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- 6. RLS Policies for Package Services
DROP POLICY IF EXISTS "Public can view package services" ON public.package_services;
DROP POLICY IF EXISTS "Admin can view all package services" ON public.package_services;
DROP POLICY IF EXISTS "Admin can insert package services" ON public.package_services;
DROP POLICY IF EXISTS "Admin can update package services" ON public.package_services;
DROP POLICY IF EXISTS "Admin can delete package services" ON public.package_services;

CREATE POLICY "Public can view package services" ON public.package_services FOR SELECT USING (true);

CREATE POLICY "Admin can view all package services" ON public.package_services FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Admin can insert package services" ON public.package_services FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Admin can update package services" ON public.package_services FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Admin can delete package services" ON public.package_services FOR DELETE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
