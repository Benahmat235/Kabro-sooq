import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  isNetworkError?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary, isNetworkError }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const title = isNetworkError ? "Pas de connexion internet" : "Une erreur s'est produite";
  const message = isNetworkError 
    ? "Vérifiez votre connexion internet pour continuer à naviguer." 
    : "L'application a rencontré un problème. Veuillez réessayer.";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center bg-[#FDF6EC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8D9C4] shadow-sm flex flex-col items-center">
        <div className="h-16 w-16 rounded-2xl border flex items-center justify-center mb-6 bg-red-50 border-[#C62828]/20 text-[#C62828]">
          <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
        </div>

        <h1 className="text-xl font-playfair font-bold text-[#1C1008] tracking-tight mb-2">
          {title}
        </h1>
        
        <p className="text-sm text-[#1C1008]/70 mb-6 leading-relaxed">
          {message}
        </p>

        {error && !isNetworkError && (
          <div className="w-full bg-[#FDF6EC] rounded-xl p-3 text-left font-mono text-[11px] text-[#1C1008]/80 border border-[#E8D9C4] overflow-x-auto max-h-32 mb-6">
            <span className="font-bold text-[#C62828]">Erreur:</span> {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row w-full gap-3">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-[#C8762B] hover:bg-[#b06522] text-white font-bold text-xs py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8762B]/50 shadow-sm"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Réessayer</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-white hover:bg-gray-50 text-[#1C1008] border border-[#E8D9C4] font-bold text-xs py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8D9C4]"
          >
            <Home className="h-4 w-4" />
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
