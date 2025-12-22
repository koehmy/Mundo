// File: pages/login.js
// Task: Email/password login using Supabase.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl mx-auto mb-4">M</div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Welcome back</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-emerald-900 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-emerald-800 font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}