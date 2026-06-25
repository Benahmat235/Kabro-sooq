import React, { useState } from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { 
  X, MapPin, Tag, Phone, MessageSquare, CheckCircle2, 
  Calendar, Eye, ChevronLeft, ChevronRight, Share2, Award, Clock, Heart
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing, onClose }) => {
  const { language, user, startNewChat, savedListings, toggleFavorite } = useApp();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

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
    setIsSharing(true);
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      alert(getTranslation(language, 'signInToPublish'));
      return;
    }
    setChatLoading(true);
    try {
      await startNewChat(listing);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ouverture du chat.";
      alert(errorMessage);
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
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors shadow-md"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content Split Container */}
        <div className="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden h-full">
          
          {/* Left Panel: Images Gallery */}
          <div className="relative w-full md:w-1/2 bg-gray-900 flex flex-col justify-between shrink-0 h-[280px] sm:h-[350px] md:h-full">
            {/* Active Image */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              <img 
                src={imagesList[activeImageIdx]} 
                alt={listing.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Image Navigation Arrows */}
              {imagesList.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIdx(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIdx(prev => prev === imagesList.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Indicators */}
            {imagesList.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 px-4">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${activeImageIdx === idx ? 'bg-orange-500 w-5' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Complete Details */}
          <div className="w-full md:w-1/2 flex flex-col bg-white overflow-y-auto h-full p-6 sm:p-8">
            
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="flex items-center space-x-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono border border-blue-100">
                <Tag className="h-3 w-3" />
                <span>{listing.category}</span>
              </span>
              <span className="flex items-center space-x-1 rounded-full bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-wider font-mono border border-gray-100">
                <span>{getTranslation(language, 'condition')}: {getConditionLabel(listing.condition)}</span>
              </span>
            </div>

            {/* Title & Location */}
            <h2 className="mt-4 text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">
              {listing.title}
            </h2>
            
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-400">
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

            {/* Price section */}
            <div className="mt-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-blue-500 font-mono">
                  {getTranslation(language, 'price')}
                </p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono leading-tight tracking-tight">
                  {formatPrice(listing.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (!user) {
                      alert("Veuillez vous connecter pour ajouter aux favoris.");
                      return;
                    }
                    toggleFavorite(listing.id);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:scale-105 active:scale-95 transition-transform shadow-sm"
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${savedListings?.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </button>
                <button 
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isSharing && (
              <p className="mt-1 text-right text-[10px] text-green-600 font-bold font-mono">Lien copié dans le presse-papiers !</p>
            )}

            {/* Description details */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-600 whitespace-pre-line font-sans">
                {listing.description}
              </p>
            </div>

            {/* Seller profile card */}
            <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-3">{getTranslation(language, 'aboutSeller')}</p>
              <div className="flex items-center space-x-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white text-base font-bold shrink-0 shadow-md shadow-blue-100">
                  {listing.sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-gray-800 text-sm leading-none">{listing.sellerName}</span>
                    {listing.sellerIsVerified && (
                      <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center space-x-1.5 text-xs text-gray-500 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{listing.sellerResponseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions CTA Row */}
            <div className="mt-8 grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-50 shrink-0">
              
              {/* Call CTA */}
              <a 
                href={`tel:${cleanPhone}`}
                className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/20 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
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
                className="flex flex-col items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-blue-100"
                id="internal-chat-btn"
              >
                <MessageSquare className="h-4 w-4 mb-1" />
                <span>{chatLoading ? getTranslation(language, 'loading') : getTranslation(language, 'chat')}</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
