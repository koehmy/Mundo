// File: components/ListingCard.js
// Task: Reusable card component for grid display. Shows details + WhatsApp CTA.

import Image from 'next/image';
import { MapPin, ShieldCheck, MessageCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const ListingCard = ({ item, session }) => (
  <div className="group relative bg-white border border-stone-100 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-stone-200 transition-all duration-500 ease-out cursor-pointer h-full flex flex-col">
    {/* Image container */}
    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
      <Image
        src={item.image || 'https://via.placeholder.com/400'}
        alt={item.title}
        fill
        className="object-cover transform group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
     
      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md ${
          item.type === 'rental' ? 'bg-white/90 text-stone-900' : 'bg-emerald-900/90 text-white'
        }`}>
          {item.type}
        </span>
        {item.verified && (
          <span className="px-2 py-1 flex items-center gap-1 text-xs font-bold text-white bg-blue-600/90 backdrop-blur-md rounded-md">
            <ShieldCheck size={12} /> {t('verified')}
          </span>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight group-hover:text-emerald-800 transition-colors">
          {item.title}
        </h3>
      </div>
     
      <div className="flex items-center text-stone-500 text-sm mb-4">
        <MapPin size={14} className="mr-1 text-emerald-700" />
        <span className="font-medium">{item.location}</span>
        <span className="mx-2 text-stone-300">•</span>
        <span className="text-stone-400 truncate max-w-[120px]">{item.landmark}</span>
      </div>

      {item.description && (
        <p className="text-stone-600 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
        <div className="flex flex-col">
          <span className="text-xs text-stone-400 uppercase tracking-wider">
            {item.type === 'rental' ? t('monthly') : t('startingAt')}
          </span>
          <span className="font-serif text-lg font-bold text-stone-900">
            ${Number(item.price).toLocaleString()} <span className="text-xs font-sans font-normal text-stone-500">MXN</span>
          </span>
        </div>
       
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const cleanPhone = item.phone.replace(/\D/g, ''); // Remove non-digits
              window.open(`https://wa.me/${cleanPhone}?text=Hi, I saw ${item.title} on Mundo Cerca.`, '_blank');
            }}
            className="p-2 rounded-full bg-stone-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all"
            title="Contact via WhatsApp"
          >
            <MessageCircle size={20} />
          </button>
          
          {session && session.user.id === item.user_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this listing?')) {
                  fetch('/api/delete-listing', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: item.id }),
                  }).then(() => window.location.reload());
                }
              }}
              className="p-2 rounded-full bg-stone-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
              title="Delete listing"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ListingCard;