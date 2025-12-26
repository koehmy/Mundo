// File: pages/api/listings.js
// Public paginated listings API (RLS enforced)

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pagination params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Optional filters
  const type = req.query.type;
  const search = req.query.search;

  let query = supabase
    .from('listings')
    .select('id, title, type, price, location, landmark, description, phone, image, user_id, verified, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (type && (type === 'rental' || type === 'service')) {
    query = query.eq('type', type);
  }
  if (search && typeof search === 'string') {
    query = query.ilike('location', `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
  res.status(200).json({ listings: data, count });
}
