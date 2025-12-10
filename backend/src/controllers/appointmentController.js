import { supabase } from '../config/supabase.js';
import { AppointmentService } from '../services/appointmentService.js';

/**
 * Get appointments
 */
export const getAppointments = async (req, res, next) => {
  try {
    const filters = {
      patient_id: req.user.role === 'patient' ? req.user.id : req.query.patient_id,
      doctor_id: req.user.role === 'doctor' ? req.query.doctor_id : req.query.doctor_id,
      branch_id: req.query.branch_id,
      status: req.query.status,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const appointments = await AppointmentService.getAppointments(filters);

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

/**
 * Create appointment
 */
export const createAppointment = async (req, res, next) => {
  try {
    const appointment = await AppointmentService.createAppointment(
      req.body,
      req.user.id
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role === 'patient') {
      // Patients can only update their own appointments
      const { data: appointment } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', id)
        .single();

      if (!appointment || appointment.patient_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own appointments'
        });
      }

      // Patients can only cancel
      if (req.body.status && req.body.status !== 'cancelled') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Patients can only cancel appointments'
        });
      }
    }

    const appointment = await AppointmentService.updateAppointment(
      id,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role === 'patient') {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', id)
        .single();

      if (!appointment || appointment.patient_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own appointments'
        });
      }
    }

    await AppointmentService.deleteAppointment(id, req.user.id);

    res.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

