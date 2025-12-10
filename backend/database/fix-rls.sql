  -- Fix RLS infinite recursion by creating helper function and updating policies
  -- Run this AFTER schema.sql and BEFORE or REPLACE existing rls_policies.sql

  -- Drop existing policies that cause recursion (if they exist)
  DROP POLICY IF EXISTS "Admins can view all users" ON users;
  DROP POLICY IF EXISTS "Admins can update all users" ON users;
  DROP POLICY IF EXISTS "Admins can create branches" ON branches;
  DROP POLICY IF EXISTS "Admins can update branches" ON branches;
  DROP POLICY IF EXISTS "Admins can delete branches" ON branches;
  DROP POLICY IF EXISTS "Admins can create doctors" ON doctors;
  DROP POLICY IF EXISTS "Admins can update doctors" ON doctors;
  DROP POLICY IF EXISTS "Admins can delete doctors" ON doctors;
  DROP POLICY IF EXISTS "Admins can manage doctor branches" ON doctor_branches;
  DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
  DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;
  DROP POLICY IF EXISTS "Admins can view all records" ON patient_records;
  DROP POLICY IF EXISTS "Admins can create records" ON patient_records;
  DROP POLICY IF EXISTS "Admins can manage all records" ON patient_records;
  DROP POLICY IF EXISTS "Admins can view audit logs" ON appointment_audit;

  -- Create helper function to check admin role (bypasses RLS)
  CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM users
      WHERE id = user_id AND role = 'admin'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Recreate policies with the helper function
  CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can update all users"
    ON users FOR UPDATE
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can create branches"
    ON branches FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

  CREATE POLICY "Admins can update branches"
    ON branches FOR UPDATE
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can delete branches"
    ON branches FOR DELETE
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can create doctors"
    ON doctors FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

  CREATE POLICY "Admins can update doctors"
    ON doctors FOR UPDATE
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can delete doctors"
    ON doctors FOR DELETE
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can manage doctor branches"
    ON doctor_branches FOR ALL
    USING (is_admin(auth.uid()));

  CREATE POLICY "Patients can view own appointments"
    ON appointments FOR SELECT
    USING (
      patient_id = auth.uid() OR
      is_admin(auth.uid()) OR
      EXISTS (
        SELECT 1 FROM doctors d
        JOIN doctor_branches db ON d.id = appointments.doctor_id
        WHERE d.user_id = auth.uid()
      )
    );

  CREATE POLICY "Admins can manage all appointments"
    ON appointments FOR ALL
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can view all records"
    ON patient_records FOR SELECT
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can create records"
    ON patient_records FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

  CREATE POLICY "Admins can manage all records"
    ON patient_records FOR ALL
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can view audit logs"
    ON appointment_audit FOR SELECT
    USING (is_admin(auth.uid()));

