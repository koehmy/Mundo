// File: pages/api/admin/unverified-members.js
// Returns all unverified members for admin dashboard (server-side, with auth context)

import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get session (server-side)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (profileError || !profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Fetch all unverified members
  const { data: members, error: membersError } = await supabase
    .from('profiles')
    .select('id, email, full_name, username, verified, created_at')
    .eq('verified', false);

  if (membersError) {
    return res.status(500).json({ error: 'Failed to fetch members' });
  }

  res.status(200).json({ members });
}
