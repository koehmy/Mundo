// File: pages/profile.js
// Task: Show user info. Protected route.

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';

export default function ProfilePage({ session }) {
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push('/login');
  }, [session, router]);

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

          <div className="mt-8 pt-8 border-t border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Account Settings</h2>
            <div className="space-y-4 max-w-md">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors text-stone-600">
                Edit Profile Information
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors text-stone-600">
                Notification Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}