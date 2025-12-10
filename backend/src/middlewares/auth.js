import { supabase, supabaseAdmin, createAuthenticatedClient } from '../config/supabase.js';

/**
 * Middleware to validate JWT token from Supabase Auth
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    // Create authenticated supabase client for this request
    // This client will use the user's token for RLS policies
    try {
      req.supabase = await createAuthenticatedClient(token);
    } catch (error) {
      console.error('Failed to create authenticated client:', error);
      req.supabase = supabase; // Fallback to regular client
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Middleware to check user role
 */
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
      }

      // Ensure authenticated client is available
      if (!req.supabase) {
        try {
          req.supabase = await createAuthenticatedClient(req.token);
        } catch (error) {
          console.error('Failed to create authenticated client in requireRole:', error);
          req.supabase = supabaseAdmin; // Fallback to admin client
        }
      }

      // Get user role from database using authenticated client
      const client = req.supabase || supabaseAdmin;
      const { data: userData, error } = await client
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !userData) {
        console.error('Role check error:', error);
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Unable to verify user role: ${error?.message || 'User not found'}` 
        });
      }

      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        });
      }

      req.user.role = userData.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Role verification failed' 
      });
    }
  };
};

/**
 * Convenience middleware for specific roles
 */
export const requirePatient = requireRole('patient');
export const requireDoctor = requireRole('doctor');
export const requireAdmin = requireRole('admin');

