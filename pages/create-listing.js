// File: pages/create-listing.js
// Task: Allow authenticated users to create a rental or service listing.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Home, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CreateListingPage({ session }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rental',
    title: '',
    price: '',
    location: '',
    landmark: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) router.push('/login');
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1506905929635-46a48e5f8d94' : '1472214103451-9378bd02f756'}?auto=format&fit=crop&q=80&w=800`;  // Default

    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {  // 50MB limit to match Supabase
        alert('Image file is too large. Max 50MB.');
        setIsSubmitting(false);
        return;
      }

      const fileName = `${session.user.id}-${Date.now()}-${selectedFile.name}`;
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, selectedFile);

      if (error) {
        alert('Error uploading image: ' + error.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('listings').insert([{
      ...formData,
      price: Number(formData.price),
      user_id: session.user.id,
      image: imageUrl,
      verified: false // Defaults to false, admin must verify
    }]);

    if (!error) {
      router.push('/listings');
    } else {
      alert('Error creating listing: ' + error.message);
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900">Create a Listing</h2>
          <p className="text-stone-500 mt-2">Share your space or service with the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setFormData({...formData, type: 'rental'})}
              className={`cursor-pointer p-4 border rounded-xl text-center transition-all ${
                formData.type === 'rental' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Home className="mx-auto mb-2" size={24} />
              <span className="font-medium">Rental</span>
            </div>
            <div
              onClick={() => setFormData({...formData, type: 'service'})}
              className={`cursor-pointer p-4 border rounded-xl text-center transition-all ${
                formData.type === 'service' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Briefcase className="mx-auto mb-2" size={24} />
              <span className="font-medium">Service</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all"
              placeholder="e.g. Sunny Room in Roma Norte"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price (MXN)</label>
              <input
                required
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all"
                placeholder="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Colonia</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all"
                placeholder="e.g. Condesa"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nearby Landmark</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all"
              placeholder="e.g. Near Parque España"
              value={formData.landmark}
              onChange={e => setFormData({...formData, landmark: e.target.value})}
            />
            <p className="text-xs text-stone-400 mt-1">We don&apos;t show exact addresses for safety.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all resize-none"
              placeholder="Describe your rental or service in detail..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <p className="text-xs text-stone-400 mt-1">Upload a photo of your listing. Max 50MB. JPEG, PNG, or WebP only.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium text-lg hover:bg-emerald-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Publishing...
              </>
            ) : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}