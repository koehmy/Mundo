// File: pages/api/delete-listing.js
// Task: Delete a listing if user is owner or admin.

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the listing to check ownership
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  // Check if user is owner or admin
  const isOwner = session.user.id === listing.user_id;
  const isAdmin = session.user.email.includes('admin'); // Simple admin check

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Delete the listing
  const { error: deleteError } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return res.status(500).json({ error: 'Failed to delete listing' });
  }

  res.status(200).json({ message: 'Listing deleted successfully' });
}