import { supabaseAdmin } from '../config/supabase.js';
import { AuditService } from '../services/auditService.js';
import { recordFailedLogin, clearLoginAttempts } from '../middlewares/security.js';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'patient' } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for development
      user_metadata: {
        name,
        phone,
        role
      }
    });

    if (authError) {
      return res.status(400).json({
        error: 'Registration failed',
        message: authError.message
      });
    }

    // Create user record in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone,
        role
      })
      .select()
      .single();

    if (userError) {
      // Rollback: delete auth user if user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({
        error: 'Registration failed',
        message: userError.message
      });
    }

    // Log audit
    await AuditService.logCreate(authData.user.id, 'users', userData);

    // Get session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError) {
      return res.status(500).json({
        error: 'Registration successful but login failed',
        message: 'Please login manually'
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      },
      token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Record failed login attempt
      recordFailedLogin(email);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Clear login attempts on success
    clearLoginAttempts(email);

    // Get user data from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone, role')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      return res.status(500).json({
        error: 'Login failed',
        message: 'Unable to fetch user data'
      });
    }

    res.json({
      message: 'Login successful',
      user: userData,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (error) {
    next(error);
  }
};

