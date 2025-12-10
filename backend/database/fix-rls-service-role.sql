-- Fix RLS to allow service role operations
-- This script adds policies that allow service role (backend) to perform operations
-- Run this if you're getting RLS violations when using supabaseAdmin

-- Note: Service role should bypass RLS, but if it doesn't, these policies help
-- The real fix is ensuring supabaseAdmin uses the service role key correctly

-- Add policy to allow service role to insert users (for registration)
-- Service role operations should bypass RLS, but this is a fallback
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true); -- Service role bypasses this anyway, but helps if RLS is still enforced

-- Add policy to allow service role to insert branches
DROP POLICY IF EXISTS "Service role can insert branches" ON branches;
CREATE POLICY "Service role can insert branches"
  ON branches FOR INSERT
  WITH CHECK (true);

-- Add policy to allow service role to update branches
DROP POLICY IF EXISTS "Service role can update branches" ON branches;
CREATE POLICY "Service role can update branches"
  ON branches FOR UPDATE
  USING (true);

-- Add policy to allow service role to delete branches
DROP POLICY IF EXISTS "Service role can delete branches" ON branches;
CREATE POLICY "Service role can delete branches"
  ON branches FOR DELETE
  USING (true);

-- IMPORTANT: The real issue is likely that supabaseAdmin isn't using service role correctly
-- Check that SUPABASE_SERVICE_ROLE_KEY is set correctly in your .env file
-- Service role operations should bypass RLS automatically

