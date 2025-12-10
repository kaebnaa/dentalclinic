import { supabase, supabaseAdmin } from '../config/supabase.js';
import { AuditService } from './auditService.js';

/**
 * Appointment service with business logic
 */
export class AppointmentService {
  /**
   * Check if time slot is available
   */
  static async isTimeSlotAvailable(doctorId, branchId, date, startTime) {
    // Parse time
    const [hours, minutes] = startTime.split(':').map(Number);
    const appointmentHour = hours + minutes / 60;

    // Check working hours (10:00 - 19:00)
    if (appointmentHour < 10 || appointmentHour >= 19) {
      return { available: false, reason: 'Outside working hours (10:00 - 19:00)' };
    }

    // Calculate end time (assume 1 hour appointments)
    const endTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Convert times to minutes for easier comparison
    const startMinutes = hours * 60 + minutes;
    const endMinutes = (hours + 1) * 60 + minutes;

    // Check for existing appointments (exclude cancelled/completed)
    // IMPORTANT: Filter by both doctor_id AND branch_id to prevent false positives
    const { data: existing, error } = await supabaseAdmin
      .from('appointments')
      .select('id, start_time, end_time, status')
      .eq('doctor_id', doctorId)
      .eq('branch_id', branchId) // Add branch_id filter
      .eq('date', date)
      .in('status', ['booked', 'confirmed']); // Only check active appointments

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Check for time overlap
    if (existing && existing.length > 0) {
      const hasOverlap = existing.some(apt => {
        // Parse existing appointment times
        const [aptStartHours, aptStartMinutes] = apt.start_time.split(':').map(Number);
        const [aptEndHours, aptEndMinutes] = apt.end_time.split(':').map(Number);
        const aptStartMinutesTotal = aptStartHours * 60 + aptStartMinutes;
        const aptEndMinutesTotal = aptEndHours * 60 + aptEndMinutes;

        // Check for overlap: new appointment overlaps if:
        // - New start is between existing start and end, OR
        // - New end is between existing start and end, OR
        // - New appointment completely contains existing appointment, OR
        // - Existing appointment completely contains new appointment
        const overlaps = (startMinutes >= aptStartMinutesTotal && startMinutes < aptEndMinutesTotal) ||
                        (endMinutes > aptStartMinutesTotal && endMinutes <= aptEndMinutesTotal) ||
                        (startMinutes <= aptStartMinutesTotal && endMinutes >= aptEndMinutesTotal) ||
                        (startMinutes >= aptStartMinutesTotal && endMinutes <= aptEndMinutesTotal);

        return overlaps;
      });

      if (hasOverlap) {
        return { available: false, reason: 'Time slot already booked' };
      }
    }

    return { available: true };
  }

  /**
   * Create appointment with validation
   */
  static async createAppointment(appointmentData, actorId) {
    const { doctor_id, branch_id, date, start_time, notes } = appointmentData;

    // Validate time slot
    const availability = await this.isTimeSlotAvailable(
      doctor_id,
      branch_id,
      date,
      start_time
    );

    if (!availability.available) {
      throw new Error(availability.reason);
    }

    // Calculate end time
    const [hours, minutes] = start_time.split(':').map(Number);
    const endTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Create appointment
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id: actorId,
        doctor_id,
        branch_id,
        date,
        start_time,
        end_time: endTime,
        status: 'booked',
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        throw new Error('Appointment slot already booked');
      }
      throw new Error(`Failed to create appointment: ${error.message}`);
    }

    // Log audit
    await AuditService.logCreate(actorId, 'appointments', data);

    return data;
  }

  /**
   * Update appointment
   */
  static async updateAppointment(appointmentId, updates, actorId) {
    // Get current appointment
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !current) {
      throw new Error('Appointment not found');
    }

    // If updating time/date, validate availability
    if (updates.date || updates.start_time) {
      const doctorId = updates.doctor_id || current.doctor_id;
      const branchId = updates.branch_id || current.branch_id;
      const date = updates.date || current.date;
      const startTime = updates.start_time || current.start_time;

      const availability = await this.isTimeSlotAvailable(
        doctorId,
        branchId,
        date,
        startTime
      );

      if (!availability.available && current.id !== appointmentId) {
        throw new Error(availability.reason);
      }

      // Recalculate end time if start time changed
      if (updates.start_time) {
        const [hours, minutes] = updates.start_time.split(':').map(Number);
        updates.end_time = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }

    // Update appointment
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }

    // Log audit
    await AuditService.logUpdate(actorId, 'appointments', current, data);

    return data;
  }

  /**
   * Delete appointment
   */
  static async deleteAppointment(appointmentId, actorId) {
    // Get current appointment
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !current) {
      throw new Error('Appointment not found');
    }

    // Delete appointment
    const { error } = await supabaseAdmin
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      throw new Error(`Failed to delete appointment: ${error.message}`);
    }

    // Log audit
    await AuditService.logDelete(actorId, 'appointments', current);

    return { success: true };
  }

  /**
   * Get appointments with filters
   */
  static async getAppointments(filters = {}) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(id, name, email, phone),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          specialization,
          user:users!doctors_user_id_fkey(id, name, email)
        ),
        branch:branches!appointments_branch_id_fkey(id, name, address)
      `);

    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    if (filters.doctor_id) {
      query = query.eq('doctor_id', filters.doctor_id);
    }

    if (filters.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }

    query = query.order('date', { ascending: true })
      .order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    return data;
  }
}

