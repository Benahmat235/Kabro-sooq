import React from 'react';
import { Listing } from '../types';
import { getTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';
import { MapPin, Tag, CheckCircle2, Eye, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ListingCardProps {
  listing: Listing;
  onQuickView: (listing: Listing) => void;
  distance?: number;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onQuickView, distance }) => {
  const { language, savedListings, toggleFavorite, user } = useApp();

  const isSaved = savedListings?.includes(listing.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
  };

  const getConditionBadge = (cond: string) => {
    switch (cond) {
      case 'new':
        return { text: getTranslation(language, 'new'), bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'excellent':
        return { text: getTranslation(language, 'excellent'), bg: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'good':
        return { text: getTranslation(language, 'good'), bg: 'bg-amber-50 text-amber-700 border-amber-100' };
      default:
        return { text: getTranslation(language, 'used'), bg: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const conditionStyle = getConditionBadge(listing.condition);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onQuickView(listing)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onQuickView(listing);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${listing.title}, ${formatPrice(listing.price)}. ${getTranslation(language, 'condition')} : ${conditionStyle.text}. Ville : ${listing.city}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm hover:shadow-md hover:border-gray-200/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      id={`listing-card-${listing.id}`}
    >
      {/* Clean image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50">
        <img 
          src={listing.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'} 
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-md hover:scale-110 active:scale-95 transition-transform z-10 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            aria-hidden="true"
          />
        </button>
        
        {/* Sold overlay */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-10" aria-label="Vendu">
            <span className="rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-2 text-sm font-black text-red-500 uppercase tracking-widest rotate-12">
              {getTranslation(language, 'sold')}
            </span>
          </div>
        )}
      </div>

      {/* Details info */}
      <div className="flex flex-1 flex-col pt-3 pb-1 px-1">
        {/* Category & Condition Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 uppercase font-mono tracking-wider">
            {listing.category}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${conditionStyle.bg}`}>
            {conditionStyle.text}
          </span>
        </div>

        {/* Listing Title */}
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-sans">
          {listing.title}
        </h3>

        {/* Location, Date & Views Row */}
        <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-gray-500">
          <div className="flex items-center space-x-1 text-gray-600 min-w-0 flex-1 mr-2">
            <MapPin className="h-3 w-3 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{listing.city}</span>
            {distance !== undefined && (
              <span className="rounded bg-orange-50 px-1 py-0.5 text-[8px] font-black text-orange-600 font-mono shrink-0">
                {distance < 1 ? "<1" : Math.round(distance)} km
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 font-mono text-[9px] text-gray-500">
            <span>
              {new Date(listing.createdAt).toLocaleDateString(language === 'EN' ? 'en' : 'fr', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-gray-300" aria-hidden="true">•</span>
            <span className="flex items-center space-x-0.5" aria-label={`${listing.viewsCount} vues`}>
              <Eye className="h-2.5 w-2.5" aria-hidden="true" />
              <span>{listing.viewsCount}</span>
            </span>
          </div>
        </div>

        {/* Price Row */}
        <div className="mt-2.5 flex items-baseline justify-between pt-1 border-t border-gray-50">
          <span className="text-sm font-black text-blue-600 font-mono tracking-tight">
            {formatPrice(listing.price)}
          </span>
        </div>

        {/* Seller info */}
        <div className="mt-3 flex items-center space-x-2 rounded-xl bg-gray-50/50 p-1.5 border border-gray-50/80">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold shrink-0" aria-hidden="true">
            {listing.sellerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="truncate text-[10px] font-bold text-gray-800 leading-tight">
              {listing.sellerName}
            </p>
            {listing.sellerIsVerified ? (
              <div className="flex items-center space-x-0.5 text-blue-600 leading-none mt-0.5">
                <CheckCircle2 className="h-2.5 w-2.5 fill-blue-600 text-white" aria-hidden="true" />
                <span className="text-[7.5px] font-bold uppercase tracking-wider">{getTranslation(language, 'verifiedSeller')}</span>
              </div>
            ) : (
              <p className="text-[8px] text-gray-500 font-medium truncate leading-none mt-0.5">{listing.sellerResponseTime}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
