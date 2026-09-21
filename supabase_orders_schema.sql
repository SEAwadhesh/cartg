-- ==============================================================================
-- CARTG SUPERMARKET - SUPABASE DATABASE SCHEMA
-- Enables cross-device persistent order processing and real-time synchronization
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the 'orders' Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    delivery_address TEXT NOT NULL,
    delivery_type TEXT DEFAULT 'delivery',
    preferred_slot TEXT DEFAULT 'Express 45-Mins (Immediate Dispatch)',
    payment_method TEXT DEFAULT 'cod',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    delivery_fee NUMERIC(12, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '',
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the 'order_items' Line Items Table (Relational)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    unit TEXT DEFAULT '1 Pack',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    image TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies (Allow Anonymous & Authenticated Store Access)
-- Drop existing policies if already defined
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;

DROP POLICY IF EXISTS "Allow public read on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public update on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public delete on order_items" ON public.order_items;

-- Orders RLS Policies
CREATE POLICY "Allow public read on orders"
    ON public.orders
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on orders"
    ON public.orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on orders"
    ON public.orders
    FOR DELETE
    USING (true);

-- Order Items RLS Policies
CREATE POLICY "Allow public read on order_items"
    ON public.order_items
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on order_items"
    ON public.order_items
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on order_items"
    ON public.order_items
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on order_items"
    ON public.order_items
    FOR DELETE
    USING (true);

-- 7. Add Tables to Supabase Realtime Publication for instant cross-device updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
END $$;

-- ==============================================================================
-- 8. Supabase Auth Administrator Authorization (No Separate Admin Table)
-- Authentication is handled purely by Supabase Auth (auth.users).
-- Passwords remain securely inside Supabase Auth and are never stored in custom tables.
-- ==============================================================================

-- Cleanup legacy admins / admin_users / profiles tables and triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP FUNCTION IF EXISTS public.is_admin_user();
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Helper security function to verify if the requesting authenticated user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND (
        raw_app_meta_data->>'role' = 'admin'
        OR (raw_app_meta_data->>'is_admin')::boolean IS TRUE
        OR raw_user_meta_data->>'role' IN ('superadmin', 'editor', 'admin')
        OR (raw_user_meta_data->>'is_admin')::boolean IS TRUE
      )
  );
$$;

-- Secure backend RPC for admin authorization verification
CREATE OR REPLACE FUNCTION public.authorize_admin_user()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user auth.users%ROWTYPE;
  v_is_admin BOOLEAN := FALSE;
  v_role TEXT := 'superadmin';
  v_name TEXT := 'Administrator';
  v_status TEXT := 'active';
  v_user_count BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('authorized', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_user FROM auth.users WHERE id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('authorized', false, 'error', 'User not found in Supabase Auth');
  END IF;

  SELECT count(*) INTO v_user_count FROM auth.users;

  -- Determine authorization
  IF (
    v_user.raw_app_meta_data->>'role' = 'admin'
    OR (v_user.raw_app_meta_data->>'is_admin')::boolean IS TRUE
    OR v_user.raw_user_meta_data->>'role' IN ('superadmin', 'editor', 'admin')
    OR (v_user.raw_user_meta_data->>'is_admin')::boolean IS TRUE
    -- If first or only admin created in dashboard or no role yet set
    OR v_user.raw_user_meta_data->>'role' IS NULL
    OR v_user_count <= 1
  ) THEN
    v_is_admin := TRUE;
  END IF;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('authorized', false, 'error', 'Access Denied: You are not authorized as an administrator.');
  END IF;

  v_role := COALESCE(v_user.raw_user_meta_data->>'role', v_user.raw_app_meta_data->>'role', 'superadmin');
  v_name := COALESCE(v_user.raw_user_meta_data->>'name', v_user.raw_user_meta_data->>'full_name', split_part(v_user.email, '@', 1), 'Administrator');
  v_status := COALESCE(v_user.raw_user_meta_data->>'status', 'active');

  IF v_status = 'deactivated' THEN
    RETURN jsonb_build_object('authorized', false, 'error', 'This administrator account has been deactivated.');
  END IF;

  RETURN jsonb_build_object(
    'authorized', true,
    'user', jsonb_build_object(
      'id', v_user.id::text,
      'email', v_user.email,
      'name', v_name,
      'role', v_role,
      'status', v_status
    )
  );
END;
$$;

-- Secure function to list all authorized admins directly from auth.users (Callable by authorized admins)
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  raw_user_meta_data JSONB,
  raw_app_meta_data JSONB,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: You are not authorized as an administrator.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR,
    u.raw_user_meta_data,
    u.raw_app_meta_data,
    u.last_sign_in_at,
    u.created_at
  FROM auth.users u
  WHERE (
    u.raw_app_meta_data->>'role' = 'admin'
    OR (u.raw_app_meta_data->>'is_admin')::boolean IS TRUE
    OR u.raw_user_meta_data->>'role' IN ('superadmin', 'editor', 'admin')
    OR (u.raw_user_meta_data->>'is_admin')::boolean IS TRUE
    OR u.raw_user_meta_data->>'role' IS NULL
  )
  ORDER BY u.created_at ASC;
END;
$$;

-- 9. Secure RPC Function to Delete an Administrator from auth.users (Callable only by authorized CartG admins)
CREATE OR REPLACE FUNCTION public.delete_admin_user(target_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_target auth.users%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: You are not authorized as an administrator.';
  END IF;

  IF v_caller_id = target_user_id THEN
    RAISE EXCEPTION 'You cannot delete your own currently active administrator account.';
  END IF;

  SELECT * INTO v_target FROM auth.users WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found in Supabase Authentication.';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Administrator deleted successfully from Supabase Authentication.');
END;
$$;




