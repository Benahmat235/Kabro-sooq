import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReportListingButtonProps {
  listingId: string;
  listingTitle: string;
  listingSellerId: string;
  listingSellerName: string;
}

export const ReportListingButton: React.FC<ReportListingButtonProps> = ({
  listingId,
  listingTitle,
  listingSellerId,
  listingSellerName
}) => {
  const { user, submitReport } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<'fraud' | 'counterfeit' | 'inappropriate' | 'wrong_price' | 'other'>('fraud');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Veuillez vous connecter pour signaler une annonce.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Veuillez fournir une brève explication.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport(
        listingId,
        listingTitle,
        listingSellerId,
        listingSellerName,
        reason,
        comment
      );
      setIsOpen(false);
      setComment('');
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de l'envoi du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 font-sans">
      <button
        onClick={() => {
          if (!user) {
            toast.error("Veuillez vous connecter pour pouvoir signaler une annonce suspecte.");
            return;
          }
          setIsOpen(true);
        }}
        className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-100/80 transition-all active:scale-95"
        id={`report-btn-${listingId}`}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Signaler l'annonce</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-250">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800">Signaler cette annonce</h3>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">DÉTECTION DE FRAUDE</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1.5">
                  Motif du signalement
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="fraud">Fraude / Arnaque</option>
                  <option value="counterfeit">Contrefaçon ou Produit Interdit</option>
                  <option value="inappropriate">Contenu inapproprié / Abusif</option>
                  <option value="wrong_price">Prix irréaliste ou Suspect</option>
                  <option value="other">Autre raison</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1.5">
                  Détails / Explication
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Veuillez décrire pourquoi vous considérez cette annonce comme suspecte..."
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <span className="text-[10px] text-gray-400 font-mono float-right mt-1">
                  {comment.length}/1000 caractères
                </span>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-3 text-[11px] leading-relaxed text-amber-800 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Tout abus de signalement peut entraîner la suspension de votre propre compte. Veuillez ne signaler que les annonces qui enfreignent nos conditions.
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-1/2 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 rounded-xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-bold text-white shadow-md shadow-rose-200 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Envoi..." : "Signaler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
