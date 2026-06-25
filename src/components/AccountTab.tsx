import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { loginWithGoogle, logout } from '../lib/firebase';
import { User } from 'lucide-react';

export const AccountTab: React.FC = () => {
  const { language, user, listings, savedListings } = useApp();

  const myPublishedListings = user 
    ? listings.filter(l => l.sellerId === user.uid && l.status !== 'archived')
    : [];

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans shrink-0" id="account-view">
      {!user ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">{getTranslation(language, 'loginRequired')}</h3>
          <p className="text-xs text-gray-400 mb-5">Connectez-vous pour pouvoir publier, ajouter des favoris et chatter avec d'autres tchadiens.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {getTranslation(language, 'signInBtn')}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs text-center space-y-6">
          {/* Profile header display */}
          <div className="flex flex-col items-center">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
              alt={user.displayName || "User"} 
              className="h-20 w-20 rounded-full border-4 border-blue-100 shadow-md"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-base font-black text-gray-800 mt-3">{user.displayName}</h3>
            <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-1 uppercase">MEMBRE DEPUIS 2026</p>
          </div>

          {/* Profile metadata metrics */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-50 py-4 font-mono text-xs text-gray-500">
            <div className="text-center border-r border-gray-50">
              <p className="text-lg font-black text-gray-800">{myPublishedListings.length}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Annonces</p>
            </div>
            <div className="text-center border-r border-gray-50">
              <p className="text-lg font-black text-gray-800">{listings.filter(l => l.sellerId === user.uid && l.status === 'sold').length}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Vendus</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-gray-800">{savedListings?.length || 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Favoris</p>
            </div>
          </div>

          {/* Quick Info list */}
          <div className="text-left text-xs space-y-3.5 px-2">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-400">Email :</span>
              <span className="font-semibold text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-400">Uid :</span>
              <span className="font-mono text-gray-600 text-[10px] truncate max-w-[180px]">{user.uid}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
                logout();
              }
            }}
            className="w-full rounded-xl bg-red-50 hover:bg-red-100 py-3 text-xs font-bold text-red-600 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
};
