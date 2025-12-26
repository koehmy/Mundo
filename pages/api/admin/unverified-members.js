// File: pages/api/admin/unverified-members.js
// Returns all unverified members for admin dashboard (server-side, with auth context)

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get session (server-side)
  // Extract user from session (e.g., cookie, header, etc.)
  const access_token = req.cookies['sb-access-token'];
  if (!access_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Get user id from JWT
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(access_token);
  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Pagination params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch paginated unverified members (service role bypasses RLS)
  const { data: members, error: membersError, count } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, username, verified, created_at', { count: 'exact' })
    .eq('verified', false)
    .range(from, to);
  if (membersError) {
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
  res.status(200).json({ members, count });
}
