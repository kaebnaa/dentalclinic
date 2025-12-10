import { supabaseAdmin } from '../config/supabase.js';
import { AuditService } from '../services/auditService.js';

/**
 * Get doctors (optionally filtered by branch)
 */
export const getDoctors = async (req, res, next) => {
  try {
    const { branchId } = req.query;
    // Use authenticated client from middleware
    const client = req.supabase || supabaseAdmin;

    let query = client
      .from('doctors')
      .select(`
        *,
        user:users!doctors_user_id_fkey(id, name, email, phone),
        branches:doctor_branches(
          branch:branches(id, name, address, latitude, longitude)
        )
      `);

    if (branchId) {
      query = query.eq('doctor_branches.branch_id', branchId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        user:users!doctors_user_id_fkey(id, name, email, phone),
        branches:doctor_branches(
          branch:branches(id, name, address, latitude, longitude)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: error.message
      });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Create doctor (Admin only)
 */
export const createDoctor = async (req, res, next) => {
  try {
    const { name, email, phone, password, specialization, branch_ids = [] } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        role: 'doctor'
      }
    });

    if (authError) {
      return res.status(400).json({
        error: 'Failed to create doctor',
        message: authError.message
      });
    }

    // Create user record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone,
        role: 'doctor'
      })
      .select()
      .single();

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({
        error: 'Failed to create doctor',
        message: userError.message
      });
    }

    // Create doctor record
    const { data: doctorData, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert({
        user_id: authData.user.id,
        specialization
      })
      .select()
      .single();

    if (doctorError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('users').delete().eq('id', authData.user.id);
      return res.status(400).json({
        error: 'Failed to create doctor',
        message: doctorError.message
      });
    }

    // Assign branches
    if (branch_ids.length > 0) {
      const branchAssignments = branch_ids.map(branch_id => ({
        doctor_id: doctorData.id,
        branch_id
      }));

      const { error: branchError } = await supabaseAdmin
        .from('doctor_branches')
        .insert(branchAssignments);

      if (branchError) {
        console.error('Failed to assign branches:', branchError);
        // Don't fail the request, just log the error
      }
    }

    // Log audit
    await AuditService.logCreate(req.user.id, 'doctors', doctorData);
    await AuditService.logCreate(req.user.id, 'users', userData);

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: {
        ...doctorData,
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor (Admin only)
 */
export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { specialization, branch_ids, ...userUpdates } = req.body;

    // Get current doctor
    const { data: current, error: fetchError } = await supabase
      .from('doctors')
      .select('*, user:users!doctors_user_id_fkey(*)')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({
        error: 'Doctor not found'
      });
    }

    // Update doctor specialization if provided
    if (specialization !== undefined) {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .update({ specialization })
        .eq('id', id)
        .select()
        .single();

      if (doctorError) {
        throw new Error(`Failed to update doctor: ${doctorError.message}`);
      }

      await AuditService.logUpdate(req.user.id, 'doctors', current, doctorData);
    }

    // Update user info if provided
    if (Object.keys(userUpdates).length > 0) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', current.user_id)
        .select()
        .single();

      if (userError) {
        throw new Error(`Failed to update user: ${userError.message}`);
      }

      await AuditService.logUpdate(req.user.id, 'users', current.user, userData);
    }

    // Update branch assignments if provided
    if (branch_ids !== undefined) {
      // Delete existing assignments
      await supabase
        .from('doctor_branches')
        .delete()
        .eq('doctor_id', id);

      // Create new assignments
      if (branch_ids.length > 0) {
        const branchAssignments = branch_ids.map(branch_id => ({
          doctor_id: id,
          branch_id
        }));

        await supabase
          .from('doctor_branches')
          .insert(branchAssignments);
      }
    }

    // Fetch updated doctor
    const { data: updated, error: updatedError } = await supabase
      .from('doctors')
      .select(`
        *,
        user:users!doctors_user_id_fkey(*),
        branches:doctor_branches(
          branch:branches(*)
        )
      `)
      .eq('id', id)
      .single();

    res.json({
      message: 'Doctor updated successfully',
      doctor: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete doctor (Admin only)
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current doctor
    const { data: current, error: fetchError } = await supabase
      .from('doctors')
      .select('*, user:users!doctors_user_id_fkey(*)')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({
        error: 'Doctor not found'
      });
    }

    // Delete branch assignments
    await supabase
      .from('doctor_branches')
      .delete()
      .eq('doctor_id', id);

    // Delete doctor record
    await supabase
      .from('doctors')
      .delete()
      .eq('id', id);

    // Delete user record
    await supabase
      .from('users')
      .delete()
      .eq('id', current.user_id);

    // Delete auth user
    await supabaseAdmin.auth.admin.deleteUser(current.user_id);

    // Log audit
    await AuditService.logDelete(req.user.id, 'doctors', current);

    res.json({
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

