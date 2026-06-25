import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { loginWithGoogle } from '../lib/firebase';
import { PlusCircle, Eye, Trash2, CheckSquare } from 'lucide-react';

interface MyAdsTabProps {
  onPublishClick: () => void;
}

export const MyAdsTab: React.FC<MyAdsTabProps> = ({ onPublishClick }) => {
  const { language, user, listings, markListingAsSold, deleteListing } = useApp();

  const myPublishedListings = user 
    ? listings.filter(l => l.sellerId === user.uid && l.status !== 'archived')
    : [];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
  };

  return (
    <div className="space-y-6 font-sans" id="my-ads-view">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{getTranslation(language, 'myAds')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Gérez vos articles en vente sur Kabro Sooq</p>
        </div>
      </div>

      {!user ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
          <p className="text-sm font-bold text-gray-600">{getTranslation(language, 'signInToPublish')}</p>
          <button
            onClick={loginWithGoogle}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {getTranslation(language, 'signInBtn')}
          </button>
        </div>
      ) : myPublishedListings.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
          <p className="text-sm font-bold text-gray-600">Vous n'avez pas encore publié d'annonce.</p>
          <button
            onClick={onPublishClick}
            className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-100 hover:bg-orange-600"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Publier ma première annonce</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myPublishedListings.map((pubListing) => (
            <div key={pubListing.id} className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {/* Embedded item info */}
              <div className="flex items-center space-x-3">
                <img 
                  src={pubListing.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200'} 
                  alt={pubListing.title} 
                  className="h-14 w-14 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-bold text-gray-800">{pubListing.title}</h4>
                  <p className="text-xs font-black text-blue-600 mt-1">{formatPrice(pubListing.price)}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    {pubListing.status === 'sold' && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 uppercase tracking-wide">
                        Vendu
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-[10px] text-gray-400 font-mono">
                      <Eye className="h-3 w-3" />
                      <span>{pubListing.viewsCount} vues</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
                <button
                  onClick={() => markListingAsSold(pubListing.id)}
                  disabled={pubListing.status === 'sold'}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Marquer vendu</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
                      deleteListing(pubListing.id);
                    }
                  }}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
