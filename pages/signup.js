// File: pages/signup.js
// Task: Registration form.

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setSuccessMsg('Registration successful! Please check your email to confirm your account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl mx-auto mb-4">M</div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Join the community</h2>
        </div>

        {successMsg ? (
          <div className="text-center">
            <div className="text-emerald-700 bg-emerald-50 p-4 rounded-lg mb-4">
              {successMsg}
            </div>
            <Link href="/login" className="text-stone-900 underline">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
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
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-800 font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}