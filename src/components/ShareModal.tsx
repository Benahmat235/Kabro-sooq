import React, { useState } from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { X, Copy, Check, Share2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  listing: Listing;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ listing, onClose }) => {
  const { language } = useApp();
  const [copied, setCopied] = useState(false);

  // Construct absolute URL for the listing
  const shareUrl = `${window.location.origin}/listing/${listing.id}`;
  const shareTitle = listing.title;
  const shareText = `Découvrez cette superbe annonce sur Kabro Sooq : "${listing.title}" pour ${new Intl.NumberFormat('fr-FR').format(listing.price)} FCFA.`;

  // Social URLs
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success("Lien copié dans le presse-papiers !");
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
        toast.error("Impossible de copier le lien.");
      });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Partagé avec succès !");
        onClose();
      } catch (err) {
        // User cancelling is normal, don't show error unless it's a real failure
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error("Web Share API error: ", err);
          toast.error("Erreur lors du partage.");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const isWebShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 sm:p-6" id="share-modal-container">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
        id="share-modal-backdrop"
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200 font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        id="share-modal-card"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Fermer le menu de partage"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          id="share-modal-close-btn"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-3.5">
            <Share2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-black text-gray-900 tracking-tight" id="share-modal-title">
            Partager l'annonce
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-normal px-2">
            Choisissez l'un des canaux ci-dessous pour partager cette annonce avec vos proches ou sur vos réseaux.
          </p>
        </div>

        {/* Share Options Grid */}
        <div className="mt-6 grid grid-cols-4 gap-3.5" id="share-channels-grid">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/55 transition-all active:scale-95 text-center group"
            id="share-whatsapp-link"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs shadow-emerald-100 group-hover:scale-105 transition-transform">
              {/* WhatsApp custom SVG */}
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.66.986 3.288 1.506 4.96 1.507 5.428 0 9.842-4.414 9.845-9.843.001-2.63-1.019-5.101-2.872-6.958C16.672 2.006 14.2 1.012 11.585 1.012c-5.41 0-9.823 4.414-9.826 9.843-.001 2.01.528 3.975 1.532 5.714l-.975 3.565 3.652-.958zm13.125-7.46c-.287-.143-1.696-.838-1.959-.933-.262-.096-.453-.143-.644.143-.19.287-.738.933-.905 1.122-.167.189-.334.212-.621.07-2.9-.145-4.808-1.125-6.666-2.735-.37-.323-.31-.497.124-.975.253-.278.56-.653.644-.814.084-.162.042-.303-.021-.446-.063-.143-.538-1.293-.738-1.771-.194-.466-.393-.403-.538-.41-.14-.007-.3-.008-.46-.008-.16 0-.422.06-.643.303-.221.242-.843.824-.843 2.01 0 1.185.862 2.33 1.05 2.585.189.255 1.697 2.592 4.111 3.633.574.248 1.022.396 1.372.507.577.183 1.101.157 1.516.096.463-.068 1.696-.693 1.936-1.363.24-.67.24-1.243.167-1.363-.072-.12-.262-.19-.549-.33z"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-gray-700 mt-2">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-primary-100 bg-primary-50/20 hover:bg-primary-50/55 transition-all active:scale-95 text-center group"
            id="share-facebook-link"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-xs shadow-primary-100 group-hover:scale-105 transition-transform">
              {/* Facebook custom SVG */}
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-gray-700 mt-2">Facebook</span>
          </a>
          
          {/* Twitter (X) */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 text-center group"
            id="share-twitter-link"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-xs shadow-gray-200 group-hover:scale-105 transition-transform">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-gray-700 mt-2">X</span>
          </a>

          {/* Telegram */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-sky-100 bg-sky-50/20 hover:bg-sky-50/55 transition-all active:scale-95 text-center group"
            id="share-telegram-link"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-xs shadow-sky-100 group-hover:scale-105 transition-transform">
              <Send className="h-4.5 w-4.5 -translate-x-0.5 translate-y-0.5" />
            </div>
            <span className="text-[10px] font-bold text-gray-700 mt-2">Telegram</span>
          </a>
        </div>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center" id="share-divider-container">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <span className="relative bg-white px-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
            OU
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5" id="share-action-buttons">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex w-full items-center justify-between rounded-xl border border-gray-150 bg-gray-50/50 p-3 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="share-copy-btn"
          >
            <span className="truncate max-w-[200px] text-left font-mono font-medium text-gray-500">
              {shareUrl}
            </span>
            <div className="flex items-center space-x-1.5 shrink-0 text-primary-600 pl-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Copier</span>
                </>
              )}
            </div>
          </button>

          {/* Web Share API Button (if supported) */}
          {isWebShareSupported && (
            <button
              onClick={handleNativeShare}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white p-3 text-xs font-bold shadow-md shadow-primary-100 transition-all active:scale-98"
              id="share-native-btn"
            >
              <Share2 className="h-4 w-4" />
              <span>Plus d'options de partage</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
