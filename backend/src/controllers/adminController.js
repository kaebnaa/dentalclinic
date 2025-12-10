import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get all users (Admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    // For admin operations, use authenticated client if available, otherwise use admin client
    // Admin client bypasses RLS, but we prefer authenticated client to test RLS policies
    let client = req.supabase;
    
    // If authenticated client not available, try to create it
    if (!client && req.token) {
      try {
        const { createAuthenticatedClient } = await import('../config/supabase.js');
        client = await createAuthenticatedClient(req.token);
      } catch (error) {
        console.warn('Could not create authenticated client, using admin client:', error.message);
        client = supabaseAdmin;
      }
    }
    
    // Fallback to admin client
    if (!client) {
      client = supabaseAdmin;
    }

    let query = client
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs (Admin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { entity, action, actor_id, limit = 100, offset = 0 } = req.query;
    let client = req.supabase;
    
    if (!client && req.token) {
      try {
        const { createAuthenticatedClient } = await import('../config/supabase.js');
        client = await createAuthenticatedClient(req.token);
      } catch (error) {
        client = supabaseAdmin;
      }
    }
    
    if (!client) {
      client = supabaseAdmin;
    }

    let query = client
      .from('appointment_audit')
      .select(`
        *,
        actor:users!appointment_audit_actor_id_fkey(id, name, email, role)
      `)
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (entity) {
      query = query.eq('entity', entity);
    }

    if (action) {
      query = query.eq('action', action.toUpperCase());
    }

    if (actor_id) {
      query = query.eq('actor_id', actor_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics data (Admin only)
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { branch_id, doctor_id, date_from, date_to } = req.query;
    let client = req.supabase;
    
    if (!client && req.token) {
      try {
        const { createAuthenticatedClient } = await import('../config/supabase.js');
        client = await createAuthenticatedClient(req.token);
      } catch (error) {
        client = supabaseAdmin;
      }
    }
    
    if (!client) {
      client = supabaseAdmin;
    }

    // Build base query for appointments
    let appointmentQuery = client
      .from('appointments')
      .select('id, status, date, branch_id, doctor_id');

    if (branch_id) {
      appointmentQuery = appointmentQuery.eq('branch_id', branch_id);
    }

    if (doctor_id) {
      appointmentQuery = appointmentQuery.eq('doctor_id', doctor_id);
    }

    if (date_from) {
      appointmentQuery = appointmentQuery.gte('date', date_from);
    }

    if (date_to) {
      appointmentQuery = appointmentQuery.lte('date', date_to);
    }

    const { data: appointments, error: appointmentsError } = await appointmentQuery;

    if (appointmentsError) {
      throw new Error(`Failed to fetch appointments: ${appointmentsError.message}`);
    }

    // Calculate statistics
    const totalAppointments = appointments.length;
    const statusCounts = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Get branch statistics
    const branchStats = {};
    appointments.forEach(apt => {
      if (!branchStats[apt.branch_id]) {
        branchStats[apt.branch_id] = { total: 0, by_status: {} };
      }
      branchStats[apt.branch_id].total++;
      branchStats[apt.branch_id].by_status[apt.status] = 
        (branchStats[apt.branch_id].by_status[apt.status] || 0) + 1;
    });

    // Get doctor statistics
    const doctorStats = {};
    appointments.forEach(apt => {
      if (!doctorStats[apt.doctor_id]) {
        doctorStats[apt.doctor_id] = { total: 0, by_status: {} };
      }
      doctorStats[apt.doctor_id].total++;
      doctorStats[apt.doctor_id].by_status[apt.status] = 
        (doctorStats[apt.doctor_id].by_status[apt.status] || 0) + 1;
    });

    // Get daily appointment counts
    const dailyCounts = {};
    appointments.forEach(apt => {
      dailyCounts[apt.date] = (dailyCounts[apt.date] || 0) + 1;
    });

    // Get total users by role
    const { data: users, error: usersError } = await client
      .from('users')
      .select('role');

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const userStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    res.json({
      overview: {
        total_appointments: totalAppointments,
        total_users: users.length,
        user_by_role: userStats,
        appointments_by_status: statusCounts
      },
      branches: branchStats,
      doctors: doctorStats,
      daily_appointments: dailyCounts
    });
  } catch (error) {
    next(error);
  }
};

