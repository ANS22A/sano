-- Add auth_user_id to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) UNIQUE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON public.customers(auth_user_id);

-- Enable RLS on customers and bookings (if not already enabled)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Customers RLS Policies
DROP POLICY IF EXISTS "Customers can view their own profile" ON public.customers;
CREATE POLICY "Customers can view their own profile"
ON public.customers FOR SELECT
USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update their own profile" ON public.customers;
CREATE POLICY "Customers can update their own profile"
ON public.customers FOR UPDATE
USING (auth_user_id = auth.uid());

-- Bookings RLS Policies
DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
CREATE POLICY "Customers can view their own bookings"
ON public.bookings FOR SELECT
USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));
