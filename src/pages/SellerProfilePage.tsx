import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Star, Clock, MapPin, AlertTriangle, User,
  Calendar, Package, Heart, CheckCircle2, ShieldCheck, Bell, BellRing
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { toast } from 'react-hot-toast';
import { AppRoutes } from '../router';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, reviews, savedListings, toggleFavorite, followedSellers, toggleFollowSeller } = useApp();

  // Find the seller by checking listings for this sellerId
  // In a real app we'd fetch the public profile of the user from a 'users' collection
  // but here we can infer some details from their listings and reviews.
  const sellerListings = listings.filter(l => l.sellerId === id);
  const sellerActiveListings = sellerListings.filter(l => l.status === 'active');
  const sellerSoldListings = sellerListings.filter(l => l.status === 'sold');
  
  const sellerReviews = reviews.filter(r => r.sellerId === id);
  const averageRating = sellerReviews.length > 0
    ? (sellerReviews.reduce((acc, rev) => acc + rev.rating, 0) / sellerReviews.length).toFixed(1)
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (sellerListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">Vendeur introuvable</h4>
        <p className="text-xs text-gray-400 mt-2">Ce vendeur n'a aucune annonce ou n'existe pas.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-700 transition-all"
        >
          Retour
        </button>
      </div>
    );
  }

  const sellerName = sellerListings[0].sellerName || 'Vendeur Inconnu';
  const sellerResponseTime = sellerListings[0].sellerResponseTime || 'Non spécifié';
  const isVerified = sellerListings[0].sellerIsVerified;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-4xl mx-auto font-sans"
    >
      <div className="mb-6 flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-black text-gray-900">Profil du Vendeur</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-4 border-4 border-primary-100 shadow-md relative">
              <User className="h-10 w-10" />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>
            
            <h2 className="text-lg font-black text-gray-900 flex justify-center items-center gap-1.5">
              {sellerName}
            </h2>
            
            {isVerified && (
              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Identité Vérifiée</span>
              </div>
            )}
            {averageRating && parseFloat(averageRating) >= 4.5 && sellerSoldListings.length >= 2 && (
              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>Top Vendeur</span>
              </div>
            )}

            <button
              onClick={() => id && toggleFollowSeller(id)}
              className={`mt-4 w-full flex justify-center items-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                id && followedSellers?.includes(id)
                  ? 'bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {id && followedSellers?.includes(id) ? (
                <>
                  <BellRing className="h-4 w-4" />
                  <span>Suivi(e)</span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  <span>Suivre ce vendeur</span>
                </>
              )}
            </button>

            <div className="mt-6 border-t border-gray-50 pt-5 text-left space-y-4">
              {averageRating && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-bold text-gray-700">Avis</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-gray-800">{averageRating} / 5</span>
                    <span className="text-[10px] text-gray-400">({sellerReviews.length})</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold text-gray-700">Temps de réponse</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{sellerResponseTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-bold text-gray-700">Annonces vendues</span>
                </div>
                <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">{sellerSoldListings.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Listings & Reviews */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-900 mb-6 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-600" />
              <span>Annonces Actives ({sellerActiveListings.length})</span>
            </h3>

            {sellerActiveListings.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm font-medium">
                Ce vendeur n'a pas d'annonces actives.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sellerActiveListings.map(listing => (
                  <div 
                    key={listing.id}
                    onClick={() => navigate(AppRoutes.AD_DETAIL.replace(':id', listing.id))}
                    className="cursor-pointer group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'} 
                        alt={listing.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(listing.id);
                        }}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10"
                      >
                        <Heart className={`h-4 w-4 ${savedListings.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                          {listing.title}
                        </h4>
                        <p className="text-sm font-black text-primary-600 mt-1.5">
                          {new Intl.NumberFormat('fr-FR').format(listing.price)} FCFA
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-medium">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{listing.city}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {sellerReviews.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-6 flex items-center space-x-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span>Avis ({sellerReviews.length})</span>
              </h3>
              <div className="space-y-4">
                {sellerReviews.map(rev => (
                  <div key={rev.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-black text-gray-800">{rev.buyerName}</span>
                        <div className="flex items-center space-x-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
};
