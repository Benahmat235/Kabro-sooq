import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertTriangle, Check, Trash2, Eye, Hourglass, HelpCircle, ShieldAlert } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export const ReportQueue: React.FC = () => {
  const { language, reports, loadingReports, resolveReport, user } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');

  if (!user) return null;

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'fraud': return "Fraude / Arnaque";
      case 'counterfeit': return "Contrefaçon";
      case 'inappropriate': return "Inapproprié";
      case 'wrong_price': return "Prix suspect";
      default: return "Autre raison";
    }
  };

  const getReasonStyle = (reason: string) => {
    switch (reason) {
      case 'fraud': return "bg-rose-50 text-rose-700 border-rose-100";
      case 'counterfeit': return "bg-purple-50 text-purple-700 border-purple-100";
      case 'wrong_price': return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-primary-50 text-primary-700 border-primary-100";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 rounded-full bg-yellow-50 px-2.5 py-1 text-[10px] font-bold text-yellow-700 uppercase tracking-wider font-mono border border-yellow-200">
            <Hourglass className="h-3 w-3 animate-pulse" />
            <span>En attente</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center space-x-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 uppercase tracking-wider font-mono border border-green-200">
            <Check className="h-3 w-3" />
            <span>Résolu (Banni)</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono border border-gray-200">
            <ShieldCheck className="h-3 w-3" />
            <span>Rejeté</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs font-sans text-left space-y-4" id="moderation-queue-container">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-800">Modération de Sécurité</h4>
            <p className="text-[9px] text-indigo-500 font-mono tracking-wider uppercase font-bold">EXAMEN MANUEL DES SIGNALEMENTS</p>
          </div>
        </div>
        <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 font-mono">
          {reports.filter(r => r.status === 'pending').length} en attente
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {(['pending', 'resolved', 'dismissed', 'all'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
              filter === type
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-150'
                : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {type === 'pending' && "En attente"}
            {type === 'resolved' && "Résolus"}
            {type === 'dismissed' && "Rejetés"}
            {type === 'all' && "Tous"}
          </button>
        ))}
      </div>

      {loadingReports ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-[10px] text-gray-400 font-bold mt-2">Chargement de la file d'attente...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-10 bg-gray-50/40 rounded-2xl border border-dashed border-gray-150/80">
          <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-500">Aucun signalement trouvé</p>
          <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto px-4">
            {filter === 'pending'
              ? "Toutes les annonces sont saines ! Aucun signalement en attente d'examen."
              : "Aucun signalement ne correspond à ce filtre pour le moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="group relative rounded-2xl border border-gray-150/70 bg-gray-50/30 p-4 hover:bg-white hover:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide font-mono ${getReasonStyle(rep.reason)}`}>
                      {getReasonLabel(rep.reason)}
                    </span>
                    {getStatusBadge(rep.status)}
                  </div>

                  <h5 className="font-bold text-gray-800 text-xs truncate leading-snug">
                    Annonce: <span className="text-gray-900 font-black">{rep.listingTitle}</span>
                  </h5>

                  <div className="text-[10px] text-gray-500 space-y-0.5 font-medium">
                    <p>Vendeur: <span className="font-bold text-gray-700">{rep.listingSellerName}</span></p>
                    <p>Signalé par: <span className="font-bold text-gray-750">{rep.reporterName}</span></p>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold text-gray-400 shrink-0">
                  {new Date(rep.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                </span>
              </div>

              {/* Comment text block */}
              <div className="mt-3 rounded-xl bg-white border border-gray-100 p-3 shadow-3xs">
                <p className="text-xs leading-relaxed text-gray-600 font-medium">
                  "{rep.comment}"
                </p>
              </div>

              {/* Action trigger row */}
              {rep.status === 'pending' && (
                <div className="mt-3.5 flex justify-end items-center space-x-2 border-t border-gray-100/70 pt-3">
                  <button
                    onClick={() => {
                      if (confirm("Voulez-vous rejeter ce signalement et classer l'affaire sans suite ?")) {
                        resolveReport(rep.id, rep.listingId, 'dismiss');
                      }
                    }}
                    className="flex items-center space-x-1 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-gray-500 px-3 py-1.5 text-xs font-bold transition-all"
                  >
                    <span>Classer sans suite</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("ATTENTION: Voulez-vous suspendre l'annonce ? Elle sera immédiatement archivée et retirée de la place de marché.")) {
                        resolveReport(rep.id, rep.listingId, 'archive');
                      }
                    }}
                    className="flex items-center space-x-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs shadow-rose-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Bannir l'annonce</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
