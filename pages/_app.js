// File: pages/_app.js
// Task: Global layout wrapper. Handles Supabase session state and persistent Navbar.

import '../styles/globals.css';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { appWithTranslation } from '../lib/i18n';

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar session={session} />
      <main className="pb-16 animate-in">
        <Component {...pageProps} session={session} />
      </main>

      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xs">M</div>
            <span className="font-serif font-bold text-stone-900">Mundo Cerca</span>
          </div>
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} Mundo Cerca. Made with ❤️ in México.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default appWithTranslation(MyApp);
