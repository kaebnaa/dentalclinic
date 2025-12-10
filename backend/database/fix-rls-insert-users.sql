-- Fix RLS to allow user registration
-- This adds a policy to allow INSERT into users table for registration

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create policy to allow INSERT for new user registration
-- This allows the backend (using service role) to create users
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- Note: Service role should bypass RLS, but if it doesn't, this policy helps
-- The service role key should automatically bypass RLS, but this is a fallback

