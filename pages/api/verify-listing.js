// File: pages/api/verify-listing.js
// Task: Admin-only endpoint to verify a listing

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
  const { id } = req.body;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid listing id' });
  }

  // 3. Mutation logic
  const { data: listing, error: fetchError } = await supabaseAdmin
    .from('listings')
    .select('id')
    .eq('id', id)
    .single();
  if (fetchError || !listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  const { error: updateError } = await supabaseAdmin
    .from('listings')
    .update({ verified: true })
    .eq('id', id);
  if (updateError) {
    return res.status(500).json({ error: 'Failed to verify listing' });
  }
  res.status(200).json({ message: 'Listing verified' });
}
