import React, { useState } from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { toast } from 'react-hot-toast';
import { 
  X, MapPin, Tag, Phone, MessageSquare, CheckCircle2, 
  Calendar, Eye, ChevronLeft, ChevronRight, Share2, Award, Clock, Heart,
  Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { ShareModal } from './ShareModal';
import { ReportListingButton } from './ReportListingButton';

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing, onClose }) => {
  const { language, user, startNewChat, savedListings, toggleFavorite, reviews } = useApp();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showSellerReviews, setShowSellerReviews] = useState(false);

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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="detail-modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Fermer les détails de l'annonce"
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Content Split Container */}
        <div className="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden h-full">
          
          {/* Left Panel: Images Gallery */}
          <div className="relative w-full md:w-1/2 bg-gray-900 flex flex-col justify-between shrink-0 h-[280px] sm:h-[350px] md:h-full">
            {/* Active Image */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              <img 
                src={imagesList[activeImageIdx]} 
                alt={`${listing.title} - image ${activeImageIdx + 1} sur ${imagesList.length}`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              
              {/* Image Navigation Arrows */}
              {imagesList.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIdx(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
                    aria-label="Image précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIdx(prev => prev === imagesList.length - 1 ? 0 : prev + 1)}
                    aria-label="Image suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Indicators */}
            {imagesList.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 px-4" role="tablist" aria-label="Choisir l'image à afficher">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={activeImageIdx === idx}
                    aria-label={`Afficher l'image ${idx + 1}`}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${activeImageIdx === idx ? 'bg-primary-500 w-5' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Complete Details */}
          <div className="w-full md:w-1/2 flex flex-col bg-white md:overflow-y-auto md:h-full p-6 sm:p-8">
            
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="flex items-center space-x-1 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-bold text-primary-700 uppercase tracking-wider font-mono border border-primary-100">
                <Tag className="h-3 w-3" aria-hidden="true" />
                <span>{listing.category}</span>
              </span>
              <span className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-wider font-mono border border-gray-200">
                <span>{getTranslation(language, 'condition')}: {getConditionLabel(listing.condition)}</span>
              </span>
              {listing.status === 'out_of_stock' ? (
                <span className="flex items-center space-x-1 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-700 uppercase tracking-wider font-mono border border-red-100 animate-pulse">
                  <span>Rupture de stock</span>
                </span>
              ) : listing.status === 'sold' ? (
                <span className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono border border-gray-200">
                  <span>Vendu</span>
                </span>
              ) : (
                listing.quantity !== undefined && (
                  <span className={`flex items-center space-x-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider font-mono border ${listing.quantity <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    <span>Stock: {listing.quantity} {listing.quantity <= 3 ? '(Bientôt épuisé)' : ''}</span>
                  </span>
                )
              )}
            </div>

            {/* Out of Stock Notice */}
            {listing.status === 'out_of_stock' && (
              <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-100 p-3.5 text-xs font-semibold text-amber-800 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>Ce produit est actuellement en rupture de stock. N'hésitez pas à contacter le vendeur pour connaître la date de réapprovisionnement.</span>
              </div>
            )}

            {/* Title & Location */}
            <h2 id="modal-title" className="mt-4 text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">
              {listing.title}
            </h2>
            
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-500">
              <div className="flex items-center space-x-1 text-gray-600">
                <MapPin className="h-4 w-4 text-primary-600" aria-hidden="true" />
                <span>{listing.city}{listing.arrondissement ? ` - ${listing.arrondissement}` : ''}{listing.quartier ? ` (${listing.quartier})` : ''}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{new Date(listing.createdAt).toLocaleDateString(language === 'EN' ? 'en' : 'fr', { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-gray-600">
                <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{listing.viewsCount} {getTranslation(language, 'views')}</span>
              </div>
            </div>

            {/* Price section */}
            <div className="mt-5 rounded-2xl bg-primary-50/50 border border-primary-100/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary-600 font-mono">
                  {getTranslation(language, 'price')}
                </p>
                <p className="text-xl sm:text-2xl font-black text-primary-600 font-mono leading-tight tracking-tight">
                  {formatPrice(listing.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  aria-label={savedListings?.includes(listing.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:scale-105 active:scale-95 transition-transform shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${savedListings?.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                    aria-hidden="true"
                  />
                </button>
                <button 
                  onClick={handleShare}
                  aria-label="Partager cette annonce"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Description details */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</h4>
              <p id="modal-desc" className="mt-2.5 text-sm leading-relaxed text-gray-600 whitespace-pre-line font-sans">
                {listing.description}
              </p>
              
              {/* Report Listing Trigger */}
              <ReportListingButton 
                listingId={listing.id}
                listingTitle={listing.title}
                listingSellerId={listing.sellerId}
                listingSellerName={listing.sellerName}
              />
            </div>

            {/* Seller profile card */}
            <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-sans">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-3">{getTranslation(language, 'aboutSeller')}</p>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white text-base font-bold shrink-0 shadow-md shadow-primary-100" aria-hidden="true">
                    {listing.sellerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-gray-800 text-sm leading-none">{listing.sellerName}</span>
                      {listing.sellerIsVerified && (
                        <CheckCircle2 className="h-4 w-4 fill-primary-600 text-white" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-1.5 text-xs text-gray-600 font-semibold">
                      <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                      <span>{listing.sellerResponseTime}</span>
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
                        <div className="text-[10px] text-gray-400 mt-1 italic font-medium">Aucun avis pour le moment</div>
                      );
                    })()}
                  </div>
                </div>

                {/* Show/hide reviews list button */}
                {reviews.filter(r => r.sellerId === listing.sellerId).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSellerReviews(!showSellerReviews)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-white border border-gray-150 px-2.5 py-1 rounded-lg shadow-3xs"
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

            {/* Bottom Actions CTA Row */}
            <div className="mt-8 grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-50 shrink-0">
              
              {/* Call CTA */}
              <a 
                href={`tel:${cleanPhone}`}
                className="flex flex-col items-center justify-center rounded-xl border border-primary-200 bg-primary-50/20 py-2.5 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors"
                id="call-btn"
              >
                <Phone className="h-4 w-4 mb-1" />
                <span>{getTranslation(language, 'call')}</span>
              </a>

              {/* WhatsApp CTA */}
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/20 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                id="whatsapp-btn"
              >
                <MessageSquare className="h-4 w-4 mb-1 fill-emerald-600/10" />
                <span>{getTranslation(language, 'whatsapp')}</span>
              </a>

              {/* Chat Interne CTA */}
              <button 
                onClick={handleStartChat}
                disabled={chatLoading}
                className="flex flex-col items-center justify-center rounded-xl bg-primary-600 py-2.5 text-xs font-bold text-white hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-primary-100"
                id="internal-chat-btn"
              >
                <MessageSquare className="h-4 w-4 mb-1" />
                <span>{chatLoading ? getTranslation(language, 'loading') : getTranslation(language, 'chat')}</span>
              </button>

            </div>

          </div>

        </div>

      </div>
      {showShareModal && (
        <ShareModal 
          listing={listing} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
};
