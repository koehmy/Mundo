// File: pages/api/admin/unverified-listings.js
// Returns all unverified listings for admin dashboard (server-side, with auth context)

import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Only allow GET
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

  // Fetch all unverified listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, user_id, created_at, verified, image, location, landmark, description')
    .eq('verified', false);

  if (listingsError) {
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }

  res.status(200).json({ listings });
}
