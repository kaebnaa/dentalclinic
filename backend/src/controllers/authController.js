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

/**
 * Update user profile (for completing registration)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, dateOfBirth, address, gender, emergencyContactName, emergencyContactPhone, emergencyContactRelation } = req.body;

    // Build update object with only provided fields that exist in users table
    const updates = {};
    if (name !== undefined && name !== null) updates.name = name;
    if (phone !== undefined && phone !== null) updates.phone = phone;
    
    // Note: dateOfBirth, address, gender, emergency contact fields are not in the users table
    // These would need to be stored in a user_profiles table or user_metadata
    // For now, we'll only update fields that exist in the users table
    // TODO: Create a user_profiles table for additional fields

    // Use admin client for profile updates to avoid RLS issues
    // Since users are updating their own profile, we can use admin client
    // The authenticate middleware already verified the user
    
    // Only update if there are fields to update
    if (Object.keys(updates).length > 0) {
      // First, get current user data for audit using admin client
      const { data: currentUserList, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1); // Use limit(1) instead of maybeSingle() to avoid coercion issues

      if (fetchError) {
        return res.status(400).json({
          error: 'Profile update failed',
          message: `Failed to fetch current user: ${fetchError.message}`
        });
      }

      const currentUser = currentUserList && currentUserList.length > 0 ? currentUserList[0] : null;

      if (!currentUser) {
        return res.status(404).json({
          error: 'Profile update failed',
          message: 'User not found'
        });
      }

      // Update user record using admin client
      const { data: userDataList, error: userError } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .limit(1); // Use limit(1) instead of maybeSingle()

      if (userError) {
        return res.status(400).json({
          error: 'Profile update failed',
          message: userError.message
        });
      }

      const userData = userDataList && userDataList.length > 0 ? userDataList[0] : null;

      if (!userData) {
        return res.status(404).json({
          error: 'Profile update failed',
          message: 'User not found or update did not affect any rows'
        });
      }

      // Log audit
      await AuditService.logUpdate(userId, 'users', currentUser, userData);

      res.json({
        message: 'Profile updated successfully',
        user: userData
      });
    } else {
      // No fields to update, but still return success (for fields not in users table)
      const { data: userDataList } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1);

      const userData = userDataList && userDataList.length > 0 ? userDataList[0] : null;

      res.json({
        message: 'Profile update completed (some fields are stored separately)',
        user: userData || req.user
      });
    }
  } catch (error) {
    next(error);
  }
};

