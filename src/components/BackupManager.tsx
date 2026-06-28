import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Database, CloudLightning, ShieldAlert, CheckCircle2, RefreshCw, HardDrive, Calendar, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface BackupRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeKb: number;
  status: 'success' | 'failed';
  triggeredBy: string;
  counts?: {
    users: number;
    listings: number;
    reviews: number;
    chats: number;
  };
  error?: string;
}

export const BackupManager: React.FC = () => {
  const { user } = useApp();
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [backingUp, setBackingUp] = useState<boolean>(false);

  const fetchBackupHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "backup_history"), orderBy("timestamp", "desc"), limit(30));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BackupRecord[];
      setBackups(data);
    } catch (error) {
      console.error("Error loading backups:", error);
      toast.error("Erreur de récupération de l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupHistory();
  }, [user]);

  const triggerBackup = async () => {
    if (!user || backingUp) return;
    setBackingUp(true);
    const toastId = toast.loading("Sauvegarde en cours vers Google Cloud Storage...");
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "La sauvegarde a échoué.");
      }
      toast.success("Sauvegarde Firestore créée avec succès sur Cloud Storage !", { id: toastId });
      fetchBackupHistory();
    } catch (error: any) {
      console.error("Error triggering manual backup:", error);
      toast.error(error.message || "Impossible de lancer la sauvegarde.", { id: toastId });
    } finally {
      setBackingUp(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs font-sans text-left space-y-5" id="backup-manager-section">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">Sauvegardes de Données (GCS)</h4>
            <p className="text-[10px] text-gray-400">Exportation et sauvegarde sur Google Cloud Storage</p>
          </div>
        </div>
        <button
          onClick={fetchBackupHistory}
          disabled={loading || backingUp}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          title="Actualiser l'historique"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          Le système effectue automatiquement des sauvegardes quotidiennes de l'intégralité des données de l'application (vendeurs, annonces, avis et messages) vers un bucket Google Cloud Storage sécurisé.
        </p>

        <button
          onClick={triggerBackup}
          disabled={backingUp || loading}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {backingUp ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sauvegarde en cours...</span>
            </>
          ) : (
            <>
              <CloudLightning className="h-4 w-4" />
              <span>Lancer une Sauvegarde Immédiate</span>
            </>
          )}
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1">
          <span>HISTORIQUE DES SAUVEGARDES</span>
          <span>{backups.length} archive{backups.length > 1 ? 's' : ''}</span>
        </div>

        {loading && backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            <span className="text-[10px] mt-2">Chargement de l'historique...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="border border-dashed border-gray-100 rounded-2xl p-6 text-center">
            <HardDrive className="h-7 w-7 text-gray-300 mx-auto mb-2" />
            <p className="text-[11px] font-semibold text-gray-500">Aucune sauvegarde trouvée</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Lancez votre première sauvegarde pour sécuriser les données.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {backups.map((bk) => (
              <div 
                key={bk.id} 
                className={`p-3 rounded-2xl border transition-all text-xs ${
                  bk.status === 'success' 
                    ? 'border-gray-50 bg-gray-50/20 hover:bg-gray-50/55' 
                    : 'border-rose-50 bg-rose-50/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {bk.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-gray-700 truncate font-bold" title={bk.filename}>
                        {bk.filename.split('/').pop()}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5 text-[9px] text-gray-400">
                        <span className="flex items-center shrink-0">
                          <Calendar className="h-2.5 w-2.5 mr-1" />
                          {new Date(bk.timestamp).toLocaleString()}
                        </span>
                        <span className="shrink-0">•</span>
                        <span className="truncate">Par: {bk.triggeredBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] font-bold text-gray-600 block">
                      {bk.sizeKb > 1024 
                        ? `${(bk.sizeKb / 1024).toFixed(1)} MB` 
                        : `${bk.sizeKb.toFixed(1)} KB`
                      }
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${
                      bk.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {bk.status === 'success' ? 'Réussi' : 'Échec'}
                    </span>
                  </div>
                </div>

                {bk.status === 'success' && bk.counts && (
                  <div className="mt-2 pt-1.5 border-t border-gray-100/50 grid grid-cols-4 gap-1 text-center text-[9px] text-gray-400 font-mono">
                    <div>👤 {bk.counts.users} vendeurs</div>
                    <div>📦 {bk.counts.listings} annonces</div>
                    <div>⭐️ {bk.counts.reviews} avis</div>
                    <div>💬 {bk.counts.chats} chats</div>
                  </div>
                )}

                {bk.status === 'failed' && bk.error && (
                  <p className="mt-1.5 text-[9px] text-rose-600 bg-rose-50/50 p-1.5 rounded-lg border border-rose-100 flex items-start">
                    <AlertCircle className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                    <span className="break-all">{bk.error}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
