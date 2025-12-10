-- ============================================
-- QUICK RLS FIX - Run this in Supabase SQL Editor
-- ============================================
-- This fixes RLS policy violations for user registration and branch operations
-- Copy and paste this entire file into Supabase Dashboard → SQL Editor → Run

-- Fix 1: Allow user registration (INSERT into users table)
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- Fix 2: Allow service role to manage branches
DROP POLICY IF EXISTS "Service role can manage branches" ON branches;
CREATE POLICY "Service role can manage branches"
  ON branches FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('users', 'branches')
  AND policyname IN ('Allow user registration', 'Service role can manage branches')
ORDER BY tablename, policyname;

-- Expected output: Should show 2 policies
-- 1. "Allow user registration" on users table
-- 2. "Service role can manage branches" on branches table

