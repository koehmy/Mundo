import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function AdminDashboard({ session }) {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [listingsCount, setListingsCount] = useState(0);
  const [listingsPage, setListingsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersCount, setMembersCount] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/unverified-listings?page=${listingsPage}&limit=10`);
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error || 'Failed to load unverified listings.');
          setLoading(false);
          return;
        }
        setListings(json.listings || []);
        setListingsCount(json.count || 0);
        setLoading(false);
      } catch {
        setErrorMsg('Network error loading unverified listings.');
        setLoading(false);
      }
    };
    fetchListings();
  }, [session, router, listingsPage]);

  useEffect(() => {
    if (!session) return;
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const res = await fetch(`/api/admin/unverified-members?page=${membersPage}&limit=10`);
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error || 'Failed to load unverified members.');
          setMembersLoading(false);
          return;
        }
        setMembers(json.members || []);
        setMembersCount(json.count || 0);
        setMembersLoading(false);
      } catch {
        setErrorMsg('Network error loading unverified members.');
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, [session, membersPage]);

  const handleVerify = async (id) => {
    try {
      const res = await fetch('/api/verify-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setErrorMsg('Failed to verify listing.');
        return;
      }
      setListings(listings.filter(l => l.id !== id));
    } catch {
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
        setErrorMsg('Failed to delete listing.');
        return;
      }
      setListings(listings.filter(l => l.id !== id));
    } catch {
      setErrorMsg('Network error deleting listing.');
    }
  };

  const handleVerifyMember = async (user_id) => {
    try {
      const res = await fetch('/api/verify-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });
      if (!res.ok) {
        setErrorMsg('Failed to verify member.');
        return;
      }
      setMembers(members.filter(m => m.id !== user_id));
    } catch {
      setErrorMsg('Network error verifying member.');
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {errorMsg && (
        <div className="mb-4 text-red-600 text-center">{errorMsg}</div>
      )}
      <h1 className="text-3xl font-bold mb-8">Admin: Unverified Listings</h1>
      <div className="mb-2 text-sm text-stone-500">{listingsCount} total</div>
      {loading ? (
        <div>Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-stone-500">No unverified listings.</div>
      ) : (
        <>
        <div className="space-y-8">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow p-6 flex gap-6 items-center">
              <Image
                src={listing.image}
                alt={listing.title}
                width={128}
                height={96}
                className="w-32 h-24 object-cover rounded-lg border"
                unoptimized
              />
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
        {/* Pagination controls */}
        <div className="flex justify-center gap-4 mt-6">
          <button disabled={listingsPage === 1} onClick={() => setListingsPage(listingsPage - 1)} className="px-3 py-1 rounded bg-stone-100 disabled:opacity-50">Prev</button>
          <span>Page {listingsPage} of {Math.ceil(listingsCount / 10) || 1}</span>
          <button disabled={listingsPage >= Math.ceil(listingsCount / 10)} onClick={() => setListingsPage(listingsPage + 1)} className="px-3 py-1 rounded bg-stone-100 disabled:opacity-50">Next</button>
        </div>
        </>
      )}

      <h1 className="text-3xl font-bold mt-16 mb-8">Admin: Unverified Members</h1>
      <div className="mb-2 text-sm text-stone-500">{membersCount} total</div>
      {membersLoading ? (
        <div>Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-stone-500">No unverified members.</div>
      ) : (
        <>
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
        {/* Pagination controls */}
        <div className="flex justify-center gap-4 mt-6">
          <button disabled={membersPage === 1} onClick={() => setMembersPage(membersPage - 1)} className="px-3 py-1 rounded bg-stone-100 disabled:opacity-50">Prev</button>
          <span>Page {membersPage} of {Math.ceil(membersCount / 10) || 1}</span>
          <button disabled={membersPage >= Math.ceil(membersCount / 10)} onClick={() => setMembersPage(membersPage + 1)} className="px-3 py-1 rounded bg-stone-100 disabled:opacity-50">Next</button>
        </div>
        </>
      )}
    </div>
  );
}
