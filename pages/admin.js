// File: pages/admin.js
// Task: Admin dashboard for verifying listings

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage({ session }) {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    // Fetch user role
    supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!data || data.role !== 'admin') {
          router.replace('/');
        } else {
          setRole('admin');
        }
      });
  }, [session, router]);

  useEffect(() => {
    if (role === 'admin') {
      supabase
        .from('listings')
        .select('*')
        .eq('verified', false)
        .then(({ data }) => {
          setListings(data || []);
          setLoading(false);
        });
    }
  }, [role]);

  const handleVerify = async (id) => {
    await fetch('/api/verify-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setListings(listings.filter(l => l.id !== id));
  };

  const handleDelete = async (id) => {
    await fetch('/api/delete-listing', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setListings(listings.filter(l => l.id !== id));
  };

  if (!session || role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin: Unverified Listings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-stone-500">No unverified listings.</div>
      ) : (
        <div className="space-y-8">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow p-6 flex gap-6 items-center">
              <img src={listing.image} alt={listing.title} className="w-32 h-24 object-cover rounded-lg border" />
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{listing.title}</h2>
                <div className="text-stone-500 mb-1">{listing.location} &mdash; {listing.landmark}</div>
                <div className="text-stone-400 text-sm mb-2">{listing.description}</div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => handleVerify(listing.id)} className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800">Verify</button>
                  <button onClick={() => handleDelete(listing.id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
