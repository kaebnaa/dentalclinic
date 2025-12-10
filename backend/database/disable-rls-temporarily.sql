-- TEMPORARY FIX: Disable RLS for testing
-- WARNING: Only use this for development/testing!
-- DO NOT use in production without proper RLS policies

-- This will allow all operations without RLS checks
-- Use only if service role isn't bypassing RLS correctly

-- Disable RLS temporarily (for testing only)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_audit DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
-- (etc. for all tables)
-- Then re-apply rls_policies.sql

