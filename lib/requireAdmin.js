// SERVER-ONLY: Centralized admin guard for API routes
// DO NOT import in client-side code or React components
// Only use in Next.js API routes or server-side utilities

import { supabase } from './supabaseClient'; // anon client for session
import { supabaseAdmin } from './supabaseAdmin'; // service role for profile check

/**
 * Validates the user session using the anon-key client.
 * Fetches the user profile using the service role client.
 * Enforces profile.role === 'admin'.
 * Terminates the request with 401/403 if not authorized.
 * Returns the authenticated user object if authorized.
 */
export async function requireAdmin(req, res) {
  // 1. Get session from cookie (fail closed)
  const access_token = req.cookies['sb-access-token'];
  if (!access_token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  // 2. Validate session using anon client (never trust JWT claims alone)
  const { data: { user }, error: sessionError } = await supabase.auth.getUser(access_token);
  if (sessionError || !user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  // 3. Fetch profile using service role client (bypass RLS, trust DB only)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  // 4. Return user object (safe for use in admin APIs)
  return user;
}
