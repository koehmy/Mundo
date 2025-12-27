// File: components/Navbar.js
// Task: Sticky, session-aware navbar. Shows Login/Signup or avatar + Logout.
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Search, PlusCircle, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import MiniLoginButton from './MiniLoginButton';

const Navbar = () => {
  const [session, setSession] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    // Fetch initial session asynchronously to avoid synchronous setState
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession ? await supabase.auth.getSession() : { data: { session: null } };
      if (isMounted) setSession(data?.session || null);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setSession(session);
    });
    return () => {
      isMounted = false;
      if (listener && listener.unsubscribe) listener.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-emerald-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl group-hover:bg-emerald-800 transition-colors">
              M
            </div>
            <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">Mundo Cerca</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/listings" className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
              <Search size={16} />
              <span className="font-medium tracking-wide text-sm uppercase">Explore</span>
            </Link>
            {session ? (
              <>
                <Link href="/create-listing" className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
                  <PlusCircle size={16} />
                  <span className="font-medium tracking-wide text-sm uppercase">List</span>
                </Link>
                <Link href="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
                  <User size={16} />
                  <span className="font-medium tracking-wide text-sm uppercase">Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:border-emerald-900 hover:text-emerald-900 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="ml-4 flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-5 py-2 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-emerald-900 transition-colors shadow-lg shadow-stone-200"
                  >
                    Log In
                  </Link>
                  {/* Mini login button for quick access (desktop) */}
                  <span className="hidden md:inline-block">
                    <MiniLoginButton />
                  </span>
                </div>
                {/* Mini login button for mobile (fixed, only visible on mobile) */}
                <span className="md:hidden">
                  <MiniLoginButton />
                </span>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-800 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white border-b border-stone-100 shadow-xl animate-in slide-in-from-top-2">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <Link href="/listings" className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
                <Search size={16} />
                <span className="font-medium tracking-wide text-sm uppercase">Explore Listings</span>
              </Link>
              {session ? (
                <>
                  <Link href="/create-listing" className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
                    <PlusCircle size={16} />
                    <span className="font-medium tracking-wide text-sm uppercase">Create Listing</span>
                  </Link>
                  <Link href="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
                    <User size={16} />
                    <span className="font-medium tracking-wide text-sm uppercase">My Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 text-stone-500 hover:text-red-600 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full mt-4 block text-center bg-emerald-900 text-white py-3 rounded-lg font-medium mb-2"
                  >
                    Log In / Sign Up
                  </Link>
                  <div className="w-full flex justify-center mt-2">
                    <MiniLoginButton />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;