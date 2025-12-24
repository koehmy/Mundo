// File: pages/index.js
// Task: Homepage with cinematic hero and curated listings.

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, MapPin, MessageCircle } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { supabase } from '../lib/supabaseClient';

export default function Home({ featuredListings, session }) {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://plus.unsplash.com/premium_photo-1733259726331-fddc4fc132d1?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            fill
            className="object-cover"
            alt="Mexico City Street"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-stone-50" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-[0.2em] uppercase mb-6">
            Local Marketplace
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
            Find your place <br/> in the neighborhood.
          </h1>
          <p className="text-lg md:text-xl text-stone-100 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            Verified rentals and professional services in your colonia. <br className="hidden md:block"/>
            Safe, simple, and connected via WhatsApp.
          </p>
          <Link
            href="/listings"
            className="group relative inline-flex items-center px-8 py-4 bg-white text-stone-900 rounded-full font-medium text-lg tracking-wide hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Explore Listings
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Curated for you</h2>
            <p className="text-stone-500">The latest verified additions to our community.</p>
          </div>
          <Link
            href="/listings"
            className="hidden md:flex text-emerald-800 font-medium hover:text-emerald-900 items-center gap-1"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings && featuredListings.map(item => (
            <ListingCard key={item.id} item={item} session={session} />
          ))}
        </div>

        <Link
          href="/listings"
          className="md:hidden block text-center w-full mt-8 py-3 border border-stone-200 rounded-lg text-stone-600 font-medium"
        >
          View all listings
        </Link>
      </div>

      {/* Trust Section */}
      <div className="bg-stone-900 text-stone-100 py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-6">
            <div className="w-12 h-12 mx-auto bg-stone-800 rounded-full flex items-center justify-center mb-6 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-serif text-xl mb-3">Verified Locals</h3>
            <p className="text-stone-400 text-sm leading-relaxed">Every listing is reviewed. We verify identity so you can browse with confidence.</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 mx-auto bg-stone-800 rounded-full flex items-center justify-center mb-6 text-emerald-400">
              <MapPin size={24} />
            </div>
            <h3 className="font-serif text-xl mb-3">Privacy First</h3>
            <p className="text-stone-400 text-sm leading-relaxed">We show the colonia and a landmark, never the exact address until you connect.</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 mx-auto bg-stone-800 rounded-full flex items-center justify-center mb-6 text-emerald-400">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-serif text-xl mb-3">Direct Contact</h3>
            <p className="text-stone-400 text-sm leading-relaxed">No middlemen fees. Connect directly with hosts and pros via WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side fetch for SEO and Performance
export async function getServerSideProps() {
  const { data: featuredListings } = await supabase
    .from('listings')
    .select('*')
    .limit(3)
    .order('created_at', { ascending: false });

  return {
    props: {
      featuredListings: featuredListings || [],
    },
  };
}
