// File: pages/api/verify-member.js
// Task: Admin-only endpoint to verify a member (set profile.verified = true)

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch user role from profiles
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    return res.status(403).json({ error: 'User not found' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Update member to verified
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ verified: true })
    .eq('id', user_id);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to verify member' });
  }

  res.status(200).json({ message: 'Member verified' });
}
