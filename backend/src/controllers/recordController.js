import { supabase, supabaseAdmin } from '../config/supabase.js';
import { AuditService } from '../services/auditService.js';

/**
 * Get patient records
 */
export const getRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Check permissions
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own records'
      });
    }

    // Doctors can only see records for their appointments
    if (req.user.role === 'doctor') {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!doctor) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Doctor profile not found'
        });
      }

      const { data: records, error } = await supabase
        .from('patient_records')
        .select(`
          *,
          doctor:doctors!patient_records_doctor_id_fkey(
            id,
            specialization,
            user:users!doctors_user_id_fkey(name, email)
          ),
          branch:branches!patient_records_branch_id_fkey(id, name, address),
          appointment:appointments(id, date, start_time)
        `)
        .eq('patient_id', patientId)
        .eq('doctor_id', doctor.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch records: ${error.message}`);
      }

      return res.json(records);
    }

    // Admin and patient (own records)
    const { data: records, error } = await supabase
      .from('patient_records')
      .select(`
        *,
        doctor:doctors!patient_records_doctor_id_fkey(
          id,
          specialization,
          user:users!doctors_user_id_fkey(name, email)
        ),
        branch:branches!patient_records_branch_id_fkey(id, name, address),
        appointment:appointments(id, date, start_time)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }

    res.json(records);
  } catch (error) {
    next(error);
  }
};

/**
 * Create medical record (Doctor/Admin only)
 */
export const createRecord = async (req, res, next) => {
  try {
    const { patient_id, appointment_id, notes, attachments = [] } = req.body;

    // Get doctor ID if user is doctor
    let doctorId;
    if (req.user.role === 'doctor') {
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (doctorError || !doctor) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Doctor profile not found'
        });
      }

      doctorId = doctor.id;

      // If appointment_id provided, verify doctor owns the appointment
      if (appointment_id) {
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select('doctor_id, branch_id')
          .eq('id', appointment_id)
          .single();

        if (appointmentError || !appointment) {
          return res.status(404).json({
            error: 'Appointment not found'
          });
        }

        if (appointment.doctor_id !== doctorId) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'You can only add records for your own appointments'
          });
        }
      }
    } else if (req.user.role === 'admin') {
      // Admin can specify doctor_id in body
      doctorId = req.body.doctor_id;
      if (!doctorId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'doctor_id is required for admin users'
        });
      }
    }

    // Get branch_id from appointment if not provided
    let branchId = req.body.branch_id;
    if (!branchId && appointment_id) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('branch_id')
        .eq('id', appointment_id)
        .single();

      if (appointment) {
        branchId = appointment.branch_id;
      }
    }

    if (!branchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'branch_id is required'
      });
    }

    // Create record
    const { data, error } = await supabaseAdmin
      .from('patient_records')
      .insert({
        patient_id,
        doctor_id: doctorId,
        branch_id: branchId,
        appointment_id: appointment_id || null,
        notes,
        attachments
      })
      .select(`
        *,
        doctor:doctors!patient_records_doctor_id_fkey(
          id,
          specialization,
          user:users!doctors_user_id_fkey(name, email)
        ),
        branch:branches!patient_records_branch_id_fkey(id, name, address)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }

    // Log audit
    await AuditService.logCreate(req.user.id, 'patient_records', data);

    res.status(201).json({
      message: 'Medical record created successfully',
      record: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete medical record (Doctor/Admin only)
 */
export const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current record
    const { data: current, error: fetchError } = await supabase
      .from('patient_records')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    // Check permissions
    if (req.user.role === 'doctor') {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!doctor || current.doctor_id !== doctor.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own records'
        });
      }
    }

    // Delete record
    const { error } = await supabaseAdmin
      .from('patient_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }

    // Log audit
    await AuditService.logDelete(req.user.id, 'patient_records', current);

    res.json({
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

