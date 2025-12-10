-- Complete RLS Fix for Backend Operations
-- This script fixes RLS policies to allow backend service role operations
-- Run this in your Supabase SQL editor

-- ============================================
-- USERS TABLE - Allow registration
-- ============================================
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============================================
-- BRANCHES TABLE - Allow admin operations via service role
-- ============================================
-- The existing "Admins can create branches" policy should work,
-- but if service role isn't bypassing RLS, add this fallback:
DROP POLICY IF EXISTS "Service role can manage branches" ON branches;
CREATE POLICY "Service role can manage branches"
  ON branches FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Service role (SUPABASE_SERVICE_ROLE_KEY) should automatically bypass RLS
-- 2. If you're still getting RLS errors, check:
--    - Is SUPABASE_SERVICE_ROLE_KEY set correctly in .env?
--    - Is the service role key the correct one from Supabase dashboard?
--    - Are you using supabaseAdmin (not supabase) in controllers?
--
-- 3. To verify service role is working:
--    - Check Supabase dashboard > Settings > API
--    - Service role key should start with "eyJ..." (JWT token)
--    - It should be different from the anon key
--
-- 4. Alternative: Temporarily disable RLS for testing:
--    Run: disable-rls-temporarily.sql
--    (DO NOT use in production!)

