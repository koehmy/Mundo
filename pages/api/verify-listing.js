// File: pages/api/verify-listing.js
// Task: Admin-only endpoint to verify a listing

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing listing id' });

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch user role from auth.users
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    return res.status(403).json({ error: 'User not found' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Update listing to verified
  const { error: updateError } = await supabase
    .from('listings')
    .update({ verified: true })
    .eq('id', id);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to verify listing' });
  }

  res.status(200).json({ message: 'Listing verified' });
}
