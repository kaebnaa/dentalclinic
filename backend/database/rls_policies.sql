-- Row Level Security (RLS) Policies for Dental Clinic System
-- Enable RLS on all tables

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_audit ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM users WHERE id = auth.uid())
  );

-- Admins can view all users (using security definer function to avoid recursion)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can update all users (using security definer function to avoid recursion)
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (is_admin(auth.uid()));

-- ============================================
-- BRANCHES TABLE POLICIES
-- ============================================

-- Everyone can view branches
CREATE POLICY "Anyone can view branches"
  ON branches FOR SELECT
  USING (true);

-- Only admins can insert branches
CREATE POLICY "Admins can create branches"
  ON branches FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can update branches
CREATE POLICY "Admins can update branches"
  ON branches FOR UPDATE
  USING (is_admin(auth.uid()));

-- Only admins can delete branches
CREATE POLICY "Admins can delete branches"
  ON branches FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- DOCTORS TABLE POLICIES
-- ============================================

-- Everyone can view doctors
CREATE POLICY "Anyone can view doctors"
  ON doctors FOR SELECT
  USING (true);

-- Only admins can insert doctors
CREATE POLICY "Admins can create doctors"
  ON doctors FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can update doctors
CREATE POLICY "Admins can update doctors"
  ON doctors FOR UPDATE
  USING (is_admin(auth.uid()));

-- Only admins can delete doctors
CREATE POLICY "Admins can delete doctors"
  ON doctors FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- DOCTOR_BRANCHES TABLE POLICIES
-- ============================================

-- Everyone can view doctor-branch assignments
CREATE POLICY "Anyone can view doctor branches"
  ON doctor_branches FOR SELECT
  USING (true);

-- Only admins can manage doctor-branch assignments
CREATE POLICY "Admins can manage doctor branches"
  ON doctor_branches FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================

-- Patients can view their own appointments
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

-- Patients can create their own appointments
CREATE POLICY "Patients can create own appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Patients can update their own appointments
-- Note: Backend controller enforces that patients can only cancel
CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Doctors can view appointments for their assigned branches
CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      JOIN doctor_branches db ON d.id = appointments.doctor_id
      WHERE d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors can update appointments they're assigned to
CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all appointments"
  ON appointments FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- PATIENT_RECORDS TABLE POLICIES
-- ============================================

-- Patients can view their own records
CREATE POLICY "Patients can view own records"
  ON patient_records FOR SELECT
  USING (patient_id = auth.uid());

-- Doctors can view records for their appointments
CREATE POLICY "Doctors can view their patient records"
  ON patient_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = patient_records.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Admins can view all records
CREATE POLICY "Admins can view all records"
  ON patient_records FOR SELECT
  USING (is_admin(auth.uid()));

-- Doctors can create records for their appointments
CREATE POLICY "Doctors can create records"
  ON patient_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = patient_records.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Admins can create records
CREATE POLICY "Admins can create records"
  ON patient_records FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Doctors can update their own records
CREATE POLICY "Doctors can update their records"
  ON patient_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = patient_records.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Doctors can delete their own records
CREATE POLICY "Doctors can delete their records"
  ON patient_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = patient_records.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Admins can manage all records
CREATE POLICY "Admins can manage all records"
  ON patient_records FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- APPOINTMENT_AUDIT TABLE POLICIES
-- ============================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON appointment_audit FOR SELECT
  USING (is_admin(auth.uid()));

-- System can insert audit logs (via service role)
-- Note: This is handled by the backend service role, not RLS
-- RLS policies don't apply to service role operations

