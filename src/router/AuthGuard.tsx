import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { loginWithGoogle } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { useLocale } from '../providers/LocaleProvider';
import { AuthGuardProps, AppRoutes } from './types';

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loadingAuth } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user && !hasPrompted) {
      setHasPrompted(true);
      toast.error(t('loginRequired') || 'Connexion requise pour accéder à cette page');
      
      // Attempt login
      loginWithGoogle().then((res) => {
        // success, stay on page
      }).catch((err) => {
        // failed or cancelled, go to home
        navigate(AppRoutes.HOME);
      });
    }
  }, [user, loadingAuth, navigate, t, hasPrompted]);

  if (loadingAuth) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-500 font-ui text-sm animate-pulse">{t('loading') || 'Chargement...'}</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will trigger the redirect from useEffect
  }

  return <>{children}</>;
};
