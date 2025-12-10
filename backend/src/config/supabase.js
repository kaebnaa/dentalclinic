import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Client for user operations (uses RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (bypasses RLS - use with caution)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Create a Supabase client with a user's access token
 * This allows RLS policies to work correctly with the authenticated user
 */
export const createAuthenticatedClient = async (accessToken) => {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
  
  // Also set the session for auth methods
  try {
    const { data: { user } } = await client.auth.getUser(accessToken);
    if (user) {
      // Set auth state manually
      client.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken // Use access token as fallback
      }).catch(() => {
        // Ignore errors, header-based auth will work
      });
    }
  } catch (error) {
    // Header-based auth will still work
    console.warn('Could not set session, using header-based auth:', error.message);
  }
  
  return client;
};

export default supabase;

