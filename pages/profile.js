// File: pages/profile.js
// Task: Show user info. Protected route.

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';

import ListingCard from '../components/ListingCard';

// Prevent static prerendering: always SSR
export async function getServerSideProps(context) {
  return { props: {} };
}

// FIX: All hooks and logic must be inside the component function, not at the top level.
export default function ProfilePage({ session }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ full_name: '', username: '', avatar_url: '' });
  const [editStatus, setEditStatus] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    // Fetch profile
    supabase
      .from('profiles')
      .select('full_name, username, avatar_url, verified')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('[Profile Fetch]', error);
          setEditStatus('Failed to load profile.');
          return;
        }
        setProfile(data);
        setEditData({
          full_name: data?.full_name || '',
          username: data?.username || '',
          avatar_url: data?.avatar_url || '',
        });
      });
    // Fetch user's listings
    supabase
      .from('listings')
      .select('id, title, type, price, location, landmark, description, phone, image, user_id, verified, created_at')
      .eq('user_id', session.user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('[Profile Listings Fetch]', error);
          setEditStatus('Failed to load your listings.');
          setLoading(false);
          return;
        }
        setListings(data || []);
        setLoading(false);
      });
  }, [session, router]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditStatus(null);
    setAvatarError(null);
    let avatarUrl = editData.avatar_url;
    // If a new avatar file is selected, upload it
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const filePath = `${session.user.id}.${ext}`;
      try {
        // Remove existing file first (Supabase Storage upsert is not always reliable for same path)
        const { error: removeError } = await supabase.storage.from('avatars').remove([filePath]);
        if (removeError) {
          console.error('[Avatar Upload] Error removing old avatar:', removeError);
          setAvatarError('Failed to remove old avatar.');
          return;
        }
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) {
          if (uploadError.message && uploadError.message.includes('already exists')) {
            const { error: retryRemoveError } = await supabase.storage.from('avatars').remove([filePath]);
            if (retryRemoveError) {
              console.error('[Avatar Upload] Error removing avatar for retry:', retryRemoveError);
              setAvatarError('Failed to remove avatar for retry.');
              return;
            }
            const { error: retryError } = await supabase.storage
              .from('avatars')
              .upload(filePath, avatarFile, { upsert: true });
            if (retryError) {
              console.error('[Avatar Upload] Avatar upload retry error:', retryError);
              setAvatarError('Failed to upload avatar.');
              return;
            }
          } else {
            console.error('[Avatar Upload] Avatar upload error:', uploadError);
            setAvatarError('Failed to upload avatar.');
            return;
          }
        }
        const { data, error: urlError } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (urlError) {
          console.error('[Avatar Upload] Error getting public URL:', urlError);
          setAvatarError('Failed to get avatar URL.');
          return;
        }
        avatarUrl = data.publicUrl;
      } catch (err) {
        console.error('[Avatar Upload] Unexpected error:', err);
        setAvatarError('Unexpected error during avatar upload.');
        return;
      }
    }
    // Clear preview after submit
    setAvatarPreview(null);
    setAvatarFile(null);
    // Update profile with new avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editData.full_name,
        username: editData.username,
        avatar_url: avatarUrl,
      })
      .eq('id', session.user.id);
    if (error) {
      console.error('[Profile Update]', error);
      setEditStatus('Failed to update profile.');
      return;
    } else {
      setEditStatus('success');
      setProfile({ ...profile, ...editData, avatar_url: avatarUrl });
      setEditData({ ...editData, avatar_url: avatarUrl });
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="h-32 bg-stone-900 relative">
          <div className="absolute -bottom-10 left-8">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-4 border-white object-cover bg-emerald-100"
                onError={(e) => { e.target.onerror = null; e.target.src = '/file.svg'; }}
                unoptimized
              />
            ) : (
              <div className="w-24 h-24 bg-emerald-100 rounded-full border-4 border-white flex items-center justify-center text-3xl font-serif font-bold text-emerald-900">
                {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || session.user.email[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="pt-14 pb-8 px-8">
          <h1 className="text-2xl font-serif font-bold text-stone-900">{profile?.full_name || profile?.username || 'User'}</h1>
          <p className="text-stone-500 flex items-center gap-2 mt-1">
            {profile?.verified ? (
              <>
                <CheckCircle size={16} className="text-emerald-600" /> Verified Member
              </>
            ) : (
              <>
                <span className="inline-block w-4 h-4 rounded-full bg-stone-400 mr-1 align-middle" title="Unverified" /> Unverified Member
              </>
            )}
          </p>

          {/* Profile Edit Form */}
          <div className="mt-8 pt-8 border-t border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Edit Profile</h2>
            <form className="space-y-4 max-w-md" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
                  value={editData.full_name}
                  onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
                  value={editData.username}
                  onChange={e => setEditData({ ...editData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Avatar Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
                  onChange={e => {
                    setAvatarError(null);
                    const file = e.target.files[0];
                    if (!file) {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      return;
                    }
                    if (!file.type.startsWith('image/')) {
                      setAvatarError('File must be an image.');
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setAvatarError('Image must be less than 5MB.');
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      return;
                    }
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }}
                />
                {avatarError && <div className="text-red-600 mt-2">{avatarError}</div>}
                {avatarPreview && (
                  <div className="mt-2">
                    <Image
                      src={avatarPreview}
                      alt="Avatar Preview"
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover border"
                      unoptimized
                    />
                  </div>
                )}
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