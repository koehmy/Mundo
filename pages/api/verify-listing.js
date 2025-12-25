// File: pages/api/verify-listing.js
// Task: Admin-only endpoint to verify a listing

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('[Admin Verify Listing] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;
  if (!id) {
    console.error('[Admin Verify Listing] Missing listing id');
    return res.status(400).json({ error: 'Missing listing id' });
  }

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.error('[Admin Verify Listing] Session error:', sessionError);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch user role from profiles
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    console.error('[Admin Verify Listing] User fetch error:', userError);
    return res.status(403).json({ error: 'User not found' });
  }
  if (user.role !== 'admin') {
    console.error('[Admin Verify Listing] Forbidden: not admin');
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Update listing to verified
  const { error: updateError } = await supabase
    .from('listings')
    .update({ verified: true })
    .eq('id', id);

  if (updateError) {
    console.error('[Admin Verify Listing] Update error:', updateError);
    return res.status(500).json({ error: 'Failed to verify listing' });
  }

  res.status(200).json({ message: 'Listing verified' });
}
