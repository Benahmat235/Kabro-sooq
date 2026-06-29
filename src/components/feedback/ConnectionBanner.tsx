import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const ConnectionBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#1C1008] text-[#F0C060] py-2 px-4 shadow-md flex items-center justify-center space-x-2 text-sm font-medium animate-in slide-in-from-top duration-300">
      <WifiOff className="h-4 w-4" />
      <span>Vous êtes hors ligne. Vérifiez votre connexion.</span>
    </div>
  );
};
