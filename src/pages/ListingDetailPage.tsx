import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, MapPin, Tag, Phone, MessageSquare, CheckCircle2, 
  Calendar, Eye, ChevronLeft, ChevronRight, Share2, Award, Clock, Heart, AlertTriangle,
  Star, ChevronDown, ChevronUp, Bell, Camera, User
} from 'lucide-react';
import { ImageCarousel } from '../components/ImageCarousel';
import { ShareModal } from '../components/ShareModal';
import { ReportListingButton } from '../components/ReportListingButton';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, user, listings, loadingListings, startNewChat, sendMessage, savedListings, toggleFavorite, priceAlerts, togglePriceAlert, reviews } = useApp();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showSellerReviews, setShowSellerReviews] = useState(false);

  // Find the requested listing from local listings
  const listing = listings.find(l => l.id === id);

  // Auto scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loadingListings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-gray-500 font-sans">Chargement des détails de l'annonce...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-xs max-w-lg mx-auto my-12 font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">Annonce non trouvée</h4>
        <p className="text-xs text-gray-400 mt-2">Cette annonce est peut-être expirée ou a été supprimée par le vendeur.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700 transition-all"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const imagesList = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'new': return getTranslation(language, 'new');
      case 'excellent': return getTranslation(language, 'excellent');
      case 'good': return getTranslation(language, 'good');
      default: return getTranslation(language, 'used');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.error(getTranslation(language, 'signInToPublish'));
      return;
    }
    setChatLoading(true);
    try {
      await startNewChat(listing);
      // After starting a chat, redirect to messages page
      navigate('/messages');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ouverture du chat.";
      toast.error(errorMessage);
    } finally {
      setChatLoading(false);
    }
  };

  // Setup WhatsApp link (using international prefix 235 for Chad)
  const cleanPhone = listing.sellerPhone.replace(/\s+/g, '');
  const cleanWhatsApp = listing.sellerWhatsApp ? listing.sellerWhatsApp.replace(/\s+/g, '') : cleanPhone;
  const whatsappMsg = encodeURIComponent(`Bonjour ${listing.sellerName}, je vous contacte concernant votre annonce "${listing.title}" vue sur Kabro Sooq.`);
  const whatsappUrl = `https://wa.me/${cleanWhatsApp.startsWith('+') ? cleanWhatsApp.slice(1) : cleanWhatsApp}?text=${whatsappMsg}`;

  const handleRequestPhotos = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour demander des photos.");
      return;
    }
    
    try {
      setChatLoading(true);
      const chatId = await startNewChat(listing);
      if (chatId) {
        await sendMessage(chatId, "Bonjour, pourriez-vous m'envoyer plus de photos de cette annonce s'il vous plaît ?");
        toast.success("Demande envoyée !");
        // startNewChat already sets active chat and tab
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-5xl mx-auto px-2 font-sans py-4" 
      id="listing-detail-page"
    >
      {/* Breadcrumb & Back */}
      <div className="mb-4 flex flex-wrap items-center space-x-2 text-[11px] font-semibold text-gray-500">
        <button 
          onClick={() => navigate('/')}
          className="hover:text-primary-600 transition-colors"
        >
          Accueil
        </button>
        <span className="text-gray-300">/</span>
        <button 
          onClick={() => navigate(`/?category=${encodeURIComponent(listing.category)}`)}
          className="hover:text-primary-600 transition-colors"
        >
          {listing.category}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
      </div>

      {/* Back to Home Button (Optional, can be removed if breadcrumb is sufficient, but keeping to maintain previous behavior just in case) */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Retour</span>
      </button>

      {/* Main Content Card Layout */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl flex flex-col md:flex-row">
        
        {/* Left Side: Photo Carousel */}
        <div className="relative w-full md:w-1/2 bg-gray-950 flex flex-col justify-between shrink-0 h-[380px] sm:h-[450px] md:h-auto md:min-h-[480px]">
          <ImageCarousel images={imagesList} title={listing.title} />
        </div>

        {/* Right Side: Detailed Info Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-8 md:p-10">
          
          <div>
            {/* Category and Condition */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="flex items-center space-x-1 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-bold text-primary-700 uppercase tracking-wider font-mono border border-primary-100">
                <Tag className="h-3 w-3" />
                <span>{listing.category}</span>
              </span>
              <span className="flex items-center space-x-1 rounded-full bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-wider font-mono border border-gray-100">
                <span>{getTranslation(language, 'condition')}: {getConditionLabel(listing.condition)}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
              {listing.title}
            </h1>

            {/* Metadata Indicators */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-400">
              <div className="flex items-center space-x-1 text-gray-500">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span>{listing.city}{listing.arrondissement ? ` - ${listing.arrondissement}` : ''}{listing.quartier ? ` (${listing.quartier})` : ''}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="mt-6 rounded-2xl bg-primary-50/50 border border-primary-100/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary-500 font-mono">Prix</p>
                <p className="text-xl sm:text-2xl font-black text-primary-600 font-mono leading-tight tracking-tight">
                  {formatPrice(listing.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => togglePriceAlert(listing.id)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all shadow-sm active:scale-95 ${
                    priceAlerts?.includes(listing.id) 
                      ? 'bg-primary-50 text-primary-600 border-primary-200' 
                      : 'bg-white text-gray-500 hover:scale-105'
                  }`}
                  title="Alerte de baisse de prix"
                >
                  <Bell 
                    className={`h-5 w-5 ${priceAlerts?.includes(listing.id) ? 'fill-primary-600' : ''}`} 
                  />
                </button>
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:scale-105 active:scale-95 transition-transform shadow-sm"
                  title="Ajouter aux favoris"
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${savedListings?.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </button>
                <button 
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm transition-all active:scale-95"
                  title="Partager l'annonce"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Detailed description */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {listing.description}
              </p>
              
              {/* Additional Metadata */}
              <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-wider">ID Annonce</span>
                  <span className="font-mono font-bold text-gray-700">{listing.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-wider">Publié le</span>
                  <span className="font-mono font-bold text-gray-700">{new Date(listing.createdAt).toLocaleString(language === 'EN' ? 'en-US' : 'fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-wider">Vues</span>
                  <span className="font-mono font-bold text-gray-700 flex items-center space-x-1">
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                    <span>{listing.viewsCount}</span>
                  </span>
                </div>
              </div>
              
              {/* Map Location */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Localisation Approximative</span>
                </h4>
                <div className="rounded-xl overflow-hidden border border-gray-100 h-[200px] bg-gray-100 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.city + (listing.arrondissement ? ', ' + listing.arrondissement : ''))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  ></iframe>
                </div>
              </div>

              {/* Report Listing Trigger */}
              <ReportListingButton 
                listingId={listing.id}
                listingTitle={listing.title}
                listingSellerId={listing.sellerId}
                listingSellerName={listing.sellerName}
              />
            </div>

            {/* Seller Info Card */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-sans">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-3">À propos du vendeur</p>
              <div className="flex items-start justify-between">
                <div 
                  className="flex items-center space-x-3.5 cursor-pointer group"
                  onClick={() => navigate(`/seller/${listing.sellerId}`)}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold shrink-0 shadow-md shadow-primary-100 group-hover:scale-105 transition-transform">
                    {listing.sellerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5 group-hover:text-primary-600 transition-colors">
                      <span className="font-bold text-gray-800 text-sm leading-none group-hover:text-primary-600">{listing.sellerName}</span>
                      {listing.sellerIsVerified && (
                        <CheckCircle2 className="h-4 w-4 fill-primary-600 text-white" title="Identité Vérifiée" />
                      )}
                      {(() => {
                        const sellerReviews = reviews.filter(r => r.sellerId === listing.sellerId);
                        const avgRating = sellerReviews.length > 0 
                          ? (sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length)
                          : 0;
                        const soldCount = listings.filter(l => l.sellerId === listing.sellerId && l.status === 'sold').length;
                        
                        if (avgRating >= 4.5 && soldCount >= 2) {
                          return (
                            <span className="flex items-center bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ml-1">
                              <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500" />
                              Top
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-gray-500 font-semibold">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>Répond généralement en {listing.sellerResponseTime}</span>
                    </div>

                    {/* Average rating star display */}
                    {(() => {
                      const sellerReviews = reviews.filter(r => r.sellerId === listing.sellerId);
                      const averageRating = sellerReviews.length > 0 
                        ? (sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length).toFixed(1)
                        : null;

                      if (averageRating) {
                        return (
                          <div className="flex items-center space-x-1 mt-1 text-xs text-amber-500 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{averageRating} / 5 ({sellerReviews.length} {sellerReviews.length > 1 ? 'avis' : 'avis'})</span>
                          </div>
                        );
                      }
                      return (
                        <div className="text-[10px] text-gray-450 mt-1 italic font-medium">Aucun avis pour le moment</div>
                      );
                    })()}
                  </div>
                </div>

                {/* Buttons block */}
                <div className="flex flex-col items-end space-y-2">
                  <button 
                    onClick={() => navigate(`/seller/${listing.sellerId}`)}
                    className="flex items-center justify-center space-x-1.5 text-[11px] font-bold text-gray-600 hover:text-primary-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-3xs transition-colors w-full sm:w-auto"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Profil</span>
                  </button>

                  {/* Show/hide reviews list button */}
                  {reviews.filter(r => r.sellerId === listing.sellerId).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSellerReviews(!showSellerReviews)}
                      className="flex items-center justify-center space-x-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-white border border-gray-150 px-2.5 py-1.5 rounded-lg shadow-3xs w-full sm:w-auto"
                    >
                      <span>Avis</span>
                      {showSellerReviews ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable feedback list */}
              {showSellerReviews && (() => {
                const sellerReviews = reviews.filter(r => r.sellerId === listing.sellerId);
                return (
                  <div className="mt-4 pt-3.5 border-t border-gray-150/60 space-y-3 max-h-48 overflow-y-auto pr-1">
                    {sellerReviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-gray-700">{rev.buyerName}</span>
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed font-medium">"{rev.comment}"</p>
                        <div className="text-[9px] text-gray-400 font-bold font-mono mt-2 flex justify-between items-center">
                          <span className="truncate max-w-[150px]">{rev.listingTitle}</span>
                          <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* CTA Buttons Row */}
          <div className="mt-8 grid grid-cols-3 gap-3 pt-4 border-t border-gray-50 shrink-0">
            {/* Call */}
            <a 
              href={`tel:${cleanPhone}`}
              className="flex flex-col items-center justify-center rounded-xl border border-primary-200 bg-primary-50/20 py-2.5 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Phone className="h-4.5 w-4.5 mb-1" />
              <span>Appeler</span>
            </a>

            {/* WhatsApp */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/20 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <MessageSquare className="h-4.5 w-4.5 mb-1 fill-emerald-600/10" />
              <span>WhatsApp</span>
            </a>

            {/* Internal Live Chat */}
            <button 
              onClick={handleStartChat}
              disabled={chatLoading}
              className="flex flex-col items-center justify-center rounded-xl bg-primary-600 py-2.5 text-xs font-bold text-white hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-primary-100"
            >
              <MessageSquare className="h-4.5 w-4.5 mb-1" />
              <span>{chatLoading ? "Ouverture..." : "Chatter"}</span>
            </button>
          </div>

          <div className="mt-3">
            <button
              onClick={handleRequestPhotos}
              disabled={chatLoading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border-2 border-gray-100 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera className="h-4.5 w-4.5" />
              <span>Demander plus de photos</span>
            </button>
          </div>

        </div>

      </div>

      {/* Annonces Similaires */}
      {(() => {
        const similarListings = listings
          .filter(l => 
            l.id !== listing.id && 
            l.status === 'active' && 
            (l.category === listing.category || l.city === listing.city)
          )
          .map(l => {
            let score = 0;
            if (l.category === listing.category) score += 2;
            if (l.city === listing.city) score += 1;
            // Basic keyword overlap (very simple)
            const lWords = l.title.toLowerCase().split(/\s+/);
            const currentWords = listing.title.toLowerCase().split(/\s+/);
            const overlap = lWords.filter(w => w.length > 3 && currentWords.includes(w)).length;
            score += overlap;
            // Price proximity
            const priceDiff = Math.abs(l.price - listing.price) / listing.price;
            if (priceDiff < 0.2) score += 2;
            else if (priceDiff < 0.5) score += 1;
            return { listing: l, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(item => item.listing);

        if (similarListings.length === 0) return null;

        return (
          <div className="mt-12 mb-8">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary-600" />
              <span>Annonces Similaires</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarListings.map(simListing => (
                <div 
                  key={simListing.id} 
                  onClick={() => {
                    navigate(`/listing/${simListing.id}`);
                  }}
                  className="cursor-pointer group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img 
                      src={simListing.images && simListing.images.length > 0 ? simListing.images[0] : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'} 
                      alt={simListing.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                      {simListing.condition === 'new' ? 'Neuf' : 'Occasion'}
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {simListing.title}
                      </h4>
                      <p className="text-[13px] font-black text-primary-600 mt-1.5">
                        {new Intl.NumberFormat('fr-FR').format(simListing.price)} FCFA
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-medium">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{simListing.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {showShareModal && (
        <ShareModal 
          listing={listing} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </motion.div>
  );
};
