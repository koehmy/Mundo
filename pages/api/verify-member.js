// File: pages/api/verify-member.js
// Task: Admin-only endpoint to verify a member (set profile.verified = true)

import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { requireAdmin } from '../../lib/requireAdmin';

export default async function handler(req, res) {
  // 1. Authorization
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  // 2. Input validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { user_id } = req.body;
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id' });
  }

  // 3. Mutation logic
  const { data: member, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user_id)
    .single();
  if (fetchError || !member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ verified: true })
    .eq('id', user_id);
  if (updateError) {
    return res.status(500).json({ error: 'Failed to verify member' });
  }
  res.status(200).json({ message: 'Member verified' });
}
