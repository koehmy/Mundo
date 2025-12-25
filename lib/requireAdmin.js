// Centralized admin guard for API routes
// Only import in server-side code
import { supabaseAdmin } from './supabaseAdmin';

export async function getUserFromSession(req) {
  const access_token = req.cookies['sb-access-token'];
  if (!access_token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(access_token);
  if (error || !user) return null;
  return user;
}

export async function requireAdmin(req, res) {
  const user = await getUserFromSession(req);
  if (!user) {
    res.status(401).end();
    return null;
  }
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    res.status(403).end();
    return null;
  }
  return user;
}
