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
  const [errorMsg, setErrorMsg] = useState(null);
  const [checking, setChecking] = useState(true);

  // Unverified members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      setChecking(false);
      return;
    }
    // Fetch user role from profiles
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('[Admin Dashboard] Role fetch failed', error);
          setErrorMsg('Failed to load admin role.');
          setChecking(false);
          return;
        }
        if (!data || data.role !== 'admin') {
          router.replace('/');
        } else {
          setRole('admin');
        }
        setChecking(false);
      });
  }, [session, router]);

  useEffect(() => {
    if (role === 'admin') {
      fetch('/api/admin/unverified-listings')
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            console.error('[Admin Dashboard] Error fetching unverified listings:', err);
            setErrorMsg('Failed to load unverified listings.');
            setLoading(false);
            return;
          }
          const { listings } = await res.json();
          setListings(listings || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('[Admin Dashboard] Network error fetching unverified listings:', err);
          setErrorMsg('Network error loading unverified listings.');
          setLoading(false);
        });

      // Fetch unverified members
      fetch('/api/admin/unverified-members')
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            console.error('[Admin Dashboard] Error fetching unverified members:', err);
            setErrorMsg('Failed to load unverified members.');
            setMembersLoading(false);
            return;
          }
          const { members } = await res.json();
          setMembers(members || []);
          setMembersLoading(false);
        })
        .catch((err) => {
          console.error('[Admin Dashboard] Network error fetching unverified members:', err);
          setErrorMsg('Network error loading unverified members.');
          setMembersLoading(false);
        });
    }
  }, [role]);

  const handleVerify = async (id) => {
    try {
      const res = await fetch('/api/verify-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('[Admin Verify Listing]', err);
        setErrorMsg('Failed to verify listing.');
        return;
      }
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error('[Admin Verify Listing] Network error:', err);
      setErrorMsg('Network error verifying listing.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/delete-listing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('[Admin Delete Listing]', err);
        setErrorMsg('Failed to delete listing.');
        return;
      }
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error('[Admin Delete Listing] Network error:', err);
      setErrorMsg('Network error deleting listing.');
    }
  };

  // Handle member verification
  const handleVerifyMember = async (user_id) => {
    try {
      const res = await fetch('/api/verify-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('[Admin Verify Member]', err);
        setErrorMsg('Failed to verify member.');
        return;
      }
      setMembers(members.filter(m => m.id !== user_id));
    } catch (err) {
      console.error('[Admin Verify Member] Network error:', err);
      setErrorMsg('Network error verifying member.');
    }
  };

  if (checking) return <div>Loading admin…</div>;
  if (!session || role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {errorMsg && (
        <div className="mb-4 text-red-600 text-center">{errorMsg}</div>
      )}
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

      <h1 className="text-3xl font-bold mt-16 mb-8">Admin: Unverified Members</h1>
      {membersLoading ? (
        <div>Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-stone-500">No unverified members.</div>
      ) : (
        <div className="space-y-8">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow p-6 flex gap-6 items-center">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{member.full_name || member.username || member.email}</h2>
                <div className="text-stone-500 mb-1">{member.email}</div>
                <div className="text-stone-400 text-sm mb-2">Joined: {new Date(member.created_at).toLocaleDateString()}</div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => handleVerifyMember(member.id)} className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800">Verify Member</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
