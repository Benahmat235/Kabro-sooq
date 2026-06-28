import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { loginWithGoogle, logout } from '../lib/firebase';
import { User } from 'lucide-react';
import { MfaSettings } from './MfaSettings';
import { BackupManager } from './BackupManager';
import { ReportQueue } from './ReportQueue';
import { Palette, Check } from 'lucide-react';

export const AccountTab: React.FC = () => {
  const { language, user, listings, savedListings, followedSellers, theme, setTheme, reviews, loyaltyPoints } = useApp();

  const myPublishedListings = user 
    ? listings.filter(l => l.sellerId === user.uid && l.status !== 'archived')
    : [];

  const myReviews = user ? reviews.filter(r => r.sellerId === user.uid) : [];
  const averageRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : 'N/A';

  const themes = [
    { id: 'default', name: 'Original', color: 'bg-[#3b82f6]' },
    { id: 'orange', name: 'Orange', color: 'bg-[#f97316]' },
    { id: 'emerald', name: 'Vert Emeraude', color: 'bg-[#10b981]' },
    { id: 'rose', name: 'Rose', color: 'bg-[#f43f5e]' },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans shrink-0" id="account-view">
      {!user ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mx-auto mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">{getTranslation(language, 'loginRequired')}</h3>
          <p className="text-xs text-gray-400 mb-5">Connectez-vous pour pouvoir publier, ajouter des favoris et chatter avec d'autres tchadiens.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full rounded-xl bg-primary-600 py-3 text-xs font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700 transition-all"
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
              className="h-20 w-20 rounded-full border-4 border-primary-100 shadow-md"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-base font-black text-gray-800 mt-3">{user.displayName}</h3>
            <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-1 uppercase mb-4">MEMBRE DEPUIS 2026</p>
            
            <a 
              href={`/seller/${user.uid}`}
              className="flex items-center space-x-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Voir mon profil public</span>
            </a>
          </div>

          {/* Profile metadata metrics */}
          <div className="grid grid-cols-5 gap-3 border-t border-b border-gray-50 py-4 font-mono text-xs text-gray-500">
            <div className="text-center border-r border-gray-50">
              <p className="text-lg font-black text-gray-800">{myPublishedListings.length}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Annonces</p>
            </div>
            <div className="text-center border-r border-gray-50">
              <p className="text-lg font-black text-gray-800">{listings.filter(l => l.sellerId === user.uid && l.status === 'sold').length}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Vendus</p>
            </div>
            <div className="text-center border-r border-gray-50">
              <p className="text-lg font-black text-gray-800 flex items-center justify-center gap-0.5">
                {averageRating} {averageRating !== 'N/A' && <span className="text-[10px]">⭐</span>}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Avis ({myReviews.length})</p>
            </div>
            <div className="text-center border-r border-gray-50">
              <p className="text-lg font-black text-gray-800">{savedListings?.length || 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Favoris</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-gray-800">{followedSellers?.length || 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">Abonnés</p>
            </div>
          </div>

          {/* Quick Info list */}
          <div className="text-left text-xs space-y-3.5 px-2">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-400">Points de Fidélité :</span>
              <span className="font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{loyaltyPoints || 0} pts</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-400">Email :</span>
              <span className="font-semibold text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-400">Uid :</span>
              <span className="font-mono text-gray-600 text-[10px] truncate max-w-[180px]">{user.uid}</span>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="rounded-2xl border border-gray-100 p-4 text-left">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-4 w-4 text-primary-600" />
              <h4 className="text-sm font-bold text-gray-800">Thème de l'application</h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  aria-label={`Changer le thème en ${t.name}`}
                  aria-pressed={theme === t.id}
                  className={`flex flex-col items-center space-y-1.5 p-2 rounded-xl border-2 transition-all group ${theme === t.id ? 'border-primary-500 bg-primary-50/50' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className={`h-8 w-8 rounded-full ${t.color} flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}>
                    {theme === t.id && <Check className="h-4 w-4 text-white stroke-[3]" />}
                  </div>
                  <span className={`text-[9px] font-bold ${theme === t.id ? 'text-primary-700' : 'text-gray-500'}`}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MFA Settings */}
          <MfaSettings />

          {/* Moderation Queue */}
          <ReportQueue />

          {/* Backup Management (Cloud Storage) */}
          <BackupManager />

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
