import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';

// Highly responsive, fixed for mobile, static for desktop
export default function MiniLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Replace with your preferred login UI/modal
    const email = window.prompt('Email:');
    const password = window.prompt('Password:');
    if (!email || !password) {
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    // Wait for session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    // Fetch latest profile/role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError) {
      alert('Could not fetch profile.');
      setLoading(false);
      return;
    }
    if (profile.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  // Fixed on mobile, static on desktop
  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="text-xs px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 border border-stone-300 shadow-sm fixed bottom-4 right-4 md:static md:ml-2 md:bottom-auto md:right-auto"
      aria-label="Quick Login"
      style={{ minWidth: 32, zIndex: 1000 }}
    >
      {loading ? '...' : '🔒 Login'}
    </button>
  );
}
