// File: pages/listings.js
// Task: Show all listings with separate tabs for rentals vs. services.

import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { supabase } from '../lib/supabaseClient';

export default function ListingsPage({ initialListings, session, errorMsg }) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [listings] = useState(initialListings || []);

  const filtered = useMemo(() => {
    return listings.filter(item => {
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      const matchesSearch = item.location.toLowerCase().includes(search.toLowerCase()) ||
                          item.title.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [listings, activeTab, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {errorMsg && (
        <div className="mb-4 text-red-600 text-center">{errorMsg}</div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Explore Neighborhoods</h1>

          {/* Tabs */}
          <div className="flex space-x-1 bg-stone-100 p-1 rounded-lg inline-flex">
            {['all', 'rental', 'service'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Filter by location (e.g. Roma)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <ListingCard key={item.id} item={item} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-500 mb-2">No listings found.</p>
          <button onClick={() => {setActiveTab('all'); setSearch('')}} className="text-emerald-800 font-medium hover:underline">Clear filters</button>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  // Get session from cookies (SSR)
  let user = null;
  const { req } = context;
  const access_token = req.cookies['sb-access-token'];
  let errorMsg = null;
  if (access_token) {
    try {
      const { data } = await supabase.auth.getUser(access_token);
      user = data?.user;
    } catch (error) {
      console.error('[Listings SSR] Error fetching user:', error);
      errorMsg = 'Failed to load user.';
    }
  }

  let isAdmin = false;
  if (user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profileError) {
        console.error('[Listings SSR] Error fetching profile:', profileError);
        errorMsg = 'Failed to load user profile.';
      }
      isAdmin = profile?.role === 'admin';
    } catch (error) {
      console.error('[Listings SSR] Error fetching profile:', error);
      errorMsg = 'Failed to load user profile.';
    }
  }

  let initialListings = [];
  try {
    let query = supabase.from('listings').select('id, title, type, price, location, landmark, description, phone, image, user_id, verified, created_at').order('created_at', { ascending: false });
    if (!isAdmin) {
      query = query.eq('verified', true);
    }
    const { data, error: listingsError } = await query;
    if (listingsError) {
      console.error('[Listings SSR] Error fetching listings:', listingsError);
      errorMsg = 'Failed to load listings.';
    }
    initialListings = data || [];
  } catch (error) {
    console.error('[Listings SSR] Error fetching listings:', error);
    errorMsg = 'Failed to load listings.';
  }

  return {
    props: {
      initialListings,
      errorMsg,
    },
  };
}