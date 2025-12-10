# RLS (Row Level Security) Fix Guide

## 🔴 Problem

Getting errors like:
- `new row violates row-level security policy for table "users"`
- `new row violates row-level security policy for table "branches"`

Even when using `supabaseAdmin` (service role).

## 🔍 Root Cause

The service role key should **automatically bypass RLS**, but sometimes:
1. Service role key not configured correctly
2. RLS policies are too restrictive
3. Supabase client not using service role correctly

## ✅ Solutions

### Option 1: Verify Service Role Key (Recommended)

1. **Check your `.env` file:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Get the correct key from Supabase:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy the **Service Role Key** (not the anon key)
   - It should start with `eyJ...` (JWT token)

3. **Verify it's different from anon key:**
   ```bash
   # In your .env
   SUPABASE_ANON_KEY=eyJ...  # Different
   SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Different (longer)
   ```

### Option 2: Add RLS Policies for Service Role

Run this SQL in Supabase SQL Editor:

```sql
-- Allow user registration
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow service role to manage branches
DROP POLICY IF EXISTS "Service role can manage branches" ON branches;
CREATE POLICY "Service role can manage branches"
  ON branches FOR ALL
  USING (true)
  WITH CHECK (true);
```

Or run the complete fix:
```bash
# In Supabase SQL Editor, run:
backend/database/fix-rls-complete.sql
```

### Option 3: Temporarily Disable RLS (Testing Only)

⚠️ **WARNING: Only for development/testing!**

```sql
-- Run in Supabase SQL Editor
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
```

To re-enable later:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
-- Then re-run rls_policies.sql
```

## 🔧 Verify Fix

1. **Check backend is using service role:**
   ```javascript
   // In backend/src/controllers/authController.js
   // Should use supabaseAdmin (not supabase)
   import { supabaseAdmin } from '../config/supabase.js';
   ```

2. **Test registration:**
   ```bash
   npm run test:comprehensive
   ```

3. **Check Supabase logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for RLS policy violations

## 📝 Files Created

- `fix-rls-insert-users.sql` - Allows user registration
- `fix-rls-complete.sql` - Complete fix for all tables
- `disable-rls-temporarily.sql` - Disable RLS (testing only)

## 🎯 Quick Fix

**Fastest solution for testing:**

1. Run in Supabase SQL Editor:
   ```sql
   -- Allow user registration
   CREATE POLICY "Allow user registration"
     ON users FOR INSERT
     WITH CHECK (true);
   
   -- Allow branch operations
   CREATE POLICY "Service role can manage branches"
     ON branches FOR ALL
     USING (true)
     WITH CHECK (true);
   ```

2. Restart backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Run tests:
   ```bash
   npm run test:comprehensive
   ```

## ✅ Expected Result

After applying the fix:
- ✅ User registration should work
- ✅ Branch creation should work
- ✅ No more RLS policy violations

---

**If issues persist, check:**
1. Service role key is correct in `.env`
2. Backend is using `supabaseAdmin` (not `supabase`)
3. RLS policies are applied correctly in Supabase

