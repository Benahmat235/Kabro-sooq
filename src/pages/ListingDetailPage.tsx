import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, MapPin, Tag, Phone, MessageSquare, CheckCircle2, 
  Calendar, Eye, ChevronLeft, ChevronRight, Share2, Award, Clock, Heart, AlertTriangle,
  Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { ImageCarousel } from '../components/ImageCarousel';
import { ShareModal } from '../components/ShareModal';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, user, listings, loadingListings, startNewChat, savedListings, toggleFavorite, reviews } = useApp();
  
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-gray-500 font-sans">Chargement des détails de l'annonce...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-xs max-w-lg mx-auto my-12 font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">Annonce non trouvée</h4>
        <p className="text-xs text-gray-400 mt-2">Cette annonce est peut-être expirée ou a été supprimée par le vendeur.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-all"
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-5xl mx-auto px-2 font-sans py-4" 
      id="listing-detail-page"
    >
      {/* Back to Home Button */}
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
              <span className="flex items-center space-x-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono border border-blue-100">
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
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>{listing.city}{listing.arrondissement ? ` - ${listing.arrondissement}` : ''}{listing.quartier ? ` (${listing.quartier})` : ''}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-gray-500">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{new Date(listing.createdAt).toLocaleDateString(language === 'EN' ? 'en' : 'fr', { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-gray-500">
                <Eye className="h-4 w-4 text-gray-400" />
                <span>{listing.viewsCount} {getTranslation(language, 'views')}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="mt-6 rounded-2xl bg-blue-50/50 border border-blue-100/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-blue-500 font-mono">Prix</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono leading-tight tracking-tight">
                  {formatPrice(listing.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:scale-105 active:scale-95 transition-transform shadow-sm"
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${savedListings?.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </button>
                <button 
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm transition-all active:scale-95"
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
            </div>

            {/* Seller Info Card */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-sans">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-3">À propos du vendeur</p>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold shrink-0 shadow-md shadow-blue-100">
                    {listing.sellerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-gray-800 text-sm leading-none">{listing.sellerName}</span>
                      {listing.sellerIsVerified && (
                        <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                      )}
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

                {/* Show/hide reviews list button */}
                {reviews.filter(r => r.sellerId === listing.sellerId).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSellerReviews(!showSellerReviews)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-150 px-2.5 py-1 rounded-lg shadow-3xs"
                  >
                    <span>Avis</span>
                    {showSellerReviews ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
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
              className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/20 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
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
              className="flex flex-col items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-blue-100"
            >
              <MessageSquare className="h-4.5 w-4.5 mb-1" />
              <span>{chatLoading ? "Ouverture..." : "Chatter"}</span>
            </button>
          </div>

        </div>

      </div>
      {showShareModal && (
        <ShareModal 
          listing={listing} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </motion.div>
  );
};
