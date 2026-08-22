CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);

CREATE OR REPLACE FUNCTION get_owner_financial_stats(p_start_date date, p_end_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_realized_revenue numeric := 0;
  v_operating_expenses numeric := 0;
  v_purchases numeric := 0;
  v_salaries_paid numeric := 0;
  v_partner_withdrawals numeric := 0;
  v_expected_revenue numeric := 0;
  v_outstanding_balance numeric := 0;
  v_bookings_total int := 0;
  v_bookings_completed int := 0;
  v_bookings_cancelled int := 0;
  v_bookings_pending int := 0;
  v_customer_count int := 0;
  v_user_role text;
BEGIN
  -- 1. Security Check
  SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
  IF v_user_role != 'admin' AND v_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admin can access owner stats.';
  END IF;

  -- 2. Sales (Realized Revenue)
  SELECT COALESCE(SUM(CASE WHEN type = 'payment' THEN amount WHEN type = 'refund' THEN -amount ELSE 0 END), 0)
  INTO v_realized_revenue
  FROM sales
  WHERE status = 'completed' AND is_archived = false
  AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Riyadh')::date >= p_start_date 
  AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Riyadh')::date <= p_end_date;

  -- 3. Operating Expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_operating_expenses
  FROM expenses
  WHERE is_archived = false AND date >= p_start_date::text AND date <= p_end_date::text;

  -- 4. Purchases
  SELECT COALESCE(SUM(amount), 0) INTO v_purchases
  FROM purchases
  WHERE is_archived = false AND date >= p_start_date::text AND date <= p_end_date::text;

  -- 5. Salaries Paid
  SELECT COALESCE(SUM(net_salary), 0) INTO v_salaries_paid
  FROM salaries
  WHERE is_archived = false AND payment_status = 'paid'
  AND payment_date >= p_start_date::text AND payment_date <= p_end_date::text;

  -- 6. Partner Withdrawals
  SELECT COALESCE(SUM(amount), 0) INTO v_partner_withdrawals
  FROM partner_withdrawals
  WHERE is_archived = false AND status = 'completed'
  AND date >= p_start_date::text AND date <= p_end_date::text;

  -- 7. Bookings & Expected Revenue
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COALESCE(SUM(price_sar), 0)
  INTO
    v_bookings_total,
    v_bookings_completed,
    v_bookings_cancelled,
    v_bookings_pending,
    v_expected_revenue
  FROM bookings
  WHERE date >= p_start_date::text AND date <= p_end_date::text;

  -- 8. Outstanding Balance (Per-Booking Floor at 0, using JOIN)
  SELECT COALESCE(SUM(GREATEST(b.price_sar - COALESCE(s_total.net_sales, 0), 0)), 0)
  INTO v_outstanding_balance
  FROM bookings b
  LEFT JOIN (
    SELECT booking_id, SUM(CASE WHEN type = 'payment' THEN amount WHEN type = 'refund' THEN -amount ELSE 0 END) as net_sales
    FROM sales
    WHERE status = 'completed' AND is_archived = false
    GROUP BY booking_id
  ) s_total ON b.id = s_total.booking_id
  WHERE b.status = 'completed' AND b.date >= p_start_date::text AND b.date <= p_end_date::text;

  -- 9. Total Customer Count
  SELECT COUNT(*) INTO v_customer_count FROM customers;

  -- 10. Compile JSON
  RETURN json_build_object(
    'realized_revenue', v_realized_revenue,
    'operating_expenses', v_operating_expenses,
    'purchases', v_purchases,
    'salaries_paid', v_salaries_paid,
    'partner_withdrawals', v_partner_withdrawals,
    'net_operating_profit', v_realized_revenue - v_operating_expenses - v_purchases - v_salaries_paid,
    'net_cash_movement', v_realized_revenue - v_operating_expenses - v_purchases - v_salaries_paid - v_partner_withdrawals,
    'expected_revenue', v_expected_revenue,
    'outstanding_balance', v_outstanding_balance,
    'bookings_total', v_bookings_total,
    'bookings_completed', v_bookings_completed,
    'bookings_cancelled', v_bookings_cancelled,
    'bookings_pending', v_bookings_pending,
    'customer_count', v_customer_count
  );
END;
$$;
