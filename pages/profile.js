// File: pages/profile.js
// Task: Show user info. Protected route.

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

import ListingCard from '../components/ListingCard';

// FIX: All hooks and logic must be inside the component function, not at the top level.
export default function ProfilePage({ session }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ display_name: '', avatar_url: '' });
  const [editStatus, setEditStatus] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    // Fetch profile
    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setEditData({
          display_name: data?.display_name || '',
          avatar_url: data?.avatar_url || '',
        });
      });
    // Fetch user's listings
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, [session, router]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditStatus(null);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editData.display_name,
        avatar_url: editData.avatar_url,
      })
      .eq('id', session.user.id);
    if (error) {
      setEditStatus('error');
    } else {
      setEditStatus('success');
      setProfile({ ...profile, ...editData });
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="h-32 bg-stone-900 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-emerald-100 rounded-full border-4 border-white flex items-center justify-center text-3xl font-serif font-bold text-emerald-900">
              {session.user.email[0].toUpperCase()}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-8 px-8">
          <h1 className="text-2xl font-serif font-bold text-stone-900">{session.user.email}</h1>
          <p className="text-stone-500 flex items-center gap-2 mt-1">
            <CheckCircle size={16} className="text-emerald-600" /> Verified Member
          </p>

          {/* Profile Edit Form */}
          <div className="mt-8 pt-8 border-t border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Edit Profile</h2>
            <form className="space-y-4 max-w-md" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
                  value={editData.display_name}
                  onChange={e => setEditData({ ...editData, display_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Avatar URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
                  value={editData.avatar_url}
                  onChange={e => setEditData({ ...editData, avatar_url: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-emerald-900 transition-colors"
              >
                Save Changes
              </button>
              {editStatus === 'success' && (
                <div className="text-emerald-700 mt-2">Profile updated!</div>
              )}
              {editStatus === 'error' && (
                <div className="text-red-600 mt-2">Error updating profile.</div>
              )}
            </form>
          </div>

          {/* My Listings Section */}
          <div className="mt-12 pt-8 border-t border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-4">My Listings</h2>
            {loading ? (
              <div>Loading...</div>
            ) : listings.length === 0 ? (
              <div className="text-stone-500">You have no listings yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {listings.map(item => (
                  <ListingCard key={item.id} item={item} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}