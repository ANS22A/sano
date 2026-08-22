-- SANO LUNA — Gift Cards Schema Migration
-- Creates gift_cards and gift_card_redemptions tables with RLS and indexes
-- Supports manual WhatsApp payment flow with initial 'pending_payment' status safely

-- 1. Create tables if they don't exist (base definition)
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    initial_amount NUMERIC(10, 2) NOT NULL CHECK (initial_amount > 0),
    remaining_balance NUMERIC(10, 2) NOT NULL CHECK (remaining_balance >= 0),
    currency TEXT NOT NULL DEFAULT 'SAR',
    theme TEXT NOT NULL DEFAULT 'classic-gold',
    
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    
    recipient_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_phone TEXT,
    personal_message TEXT,
    
    purchaser_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    purchaser_auth_user_id UUID,
    
    status TEXT NOT NULL DEFAULT 'pending_payment',
    
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gift_card_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    amount_redeemed NUMERIC(10, 2) NOT NULL CHECK (amount_redeemed > 0),
    redeemed_by_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Safely add missing columns if the table already existed before this migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gift_cards' AND column_name='order_reference') THEN
        ALTER TABLE public.gift_cards ADD COLUMN order_reference TEXT;
        -- Backfill existing rows with a unique reference
        UPDATE public.gift_cards SET order_reference = 'SL-GC-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6)) WHERE order_reference IS NULL;
        -- Make it NOT NULL and UNIQUE
        ALTER TABLE public.gift_cards ALTER COLUMN order_reference SET NOT NULL;
        ALTER TABLE public.gift_cards ADD CONSTRAINT gift_cards_order_reference_key UNIQUE (order_reference);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gift_cards' AND column_name='payment_confirmed_at') THEN
        ALTER TABLE public.gift_cards ADD COLUMN payment_confirmed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gift_cards' AND column_name='payment_confirmed_by') THEN
        ALTER TABLE public.gift_cards ADD COLUMN payment_confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Safely update Status constraints and defaults
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop existing check constraint on status column
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.gift_cards'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%';
      
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.gift_cards DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    
    -- Add the correct constraint
    ALTER TABLE public.gift_cards ADD CONSTRAINT gift_cards_status_check CHECK (status IN ('pending_payment', 'active', 'redeemed', 'expired', 'cancelled'));
    
    -- Ensure default is correct
    ALTER TABLE public.gift_cards ALTER COLUMN status SET DEFAULT 'pending_payment';
END $$;

-- 4. Indexes for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_gift_cards_order_reference ON public.gift_cards(order_reference);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient_email ON public.gift_cards(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_sender_email ON public.gift_cards(sender_email);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_gift_card ON public.gift_card_redemptions(gift_card_id);

-- 5. Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- 6. Safely recreate RLS Policies
DROP POLICY IF EXISTS "Admins and managers can manage gift_cards" ON public.gift_cards;
CREATE POLICY "Admins and managers can manage gift_cards"
    ON public.gift_cards
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'manager')
            AND profiles.is_active = true
        )
    );

DROP POLICY IF EXISTS "Staff can view gift_cards" ON public.gift_cards;
CREATE POLICY "Staff can view gift_cards"
    ON public.gift_cards
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'staff'
            AND profiles.is_active = true
        )
    );

DROP POLICY IF EXISTS "Customers can view their purchased gift cards" ON public.gift_cards;
CREATE POLICY "Customers can view their purchased gift cards"
    ON public.gift_cards
    FOR SELECT
    TO authenticated
    USING (
        purchaser_auth_user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Admins and managers can manage gift_card_redemptions" ON public.gift_card_redemptions;
CREATE POLICY "Admins and managers can manage gift_card_redemptions"
    ON public.gift_card_redemptions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'manager')
            AND profiles.is_active = true
        )
    );

DROP POLICY IF EXISTS "Staff can view gift_card_redemptions" ON public.gift_card_redemptions;
CREATE POLICY "Staff can view gift_card_redemptions"
    ON public.gift_card_redemptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'staff'
            AND profiles.is_active = true
        )
    );
