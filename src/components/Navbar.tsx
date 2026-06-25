import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { Home, MessageSquare, Plus, Grid, User } from 'lucide-react';

interface NavbarProps {
  onPublishClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPublishClick }) => {
  const { language, unreadCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadChats = unreadCount; // Represent the actual number of unread messages

  const currentPath = location.pathname;
  const isHome = currentPath === '/';
  const isMessages = currentPath.startsWith('/messages');
  const isMyAds = currentPath.startsWith('/my-ads');
  const isAccount = currentPath.startsWith('/account');

  const handlePublish = () => {
    if (onPublishClick) {
      onPublishClick();
    } else {
      navigate('/publish');
    }
  };

  return (
    <>
      {/* Mobile Bottom Tab-Bar (Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-gray-100 bg-white px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] md:hidden" id="mobile-navbar">
        <div className="mx-auto flex max-w-md items-center justify-between px-3">
          
          {/* Home Tab */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isHome ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Home className="h-5.5 w-5.5" />
            <span className="text-[10px] font-semibold mt-0.5">{getTranslation(language, 'home')}</span>
          </button>

          {/* Messages Tab */}
          <button
            onClick={() => navigate('/messages')}
            className={`relative flex flex-col items-center justify-center py-1.5 transition-colors ${isMessages ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <MessageSquare className="h-5.5 w-5.5" />
            {unreadChats > 0 && (
              <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadChats}
              </span>
            )}
            <span className="text-[10px] font-semibold mt-0.5">{getTranslation(language, 'messages')}</span>
          </button>

          {/* Center Highlighted PUBLISH Button */}
          <div className="relative -mt-6 flex flex-col items-center justify-center">
            <button
              onClick={handlePublish}
              className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 transition-transform active:scale-95 focus:outline-none"
              id="mobile-publish-btn"
            >
              <Plus className="h-7 w-7" />
            </button>
            <span className="text-[10px] font-bold text-orange-600 mt-1">{getTranslation(language, 'publish')}</span>
          </div>

          {/* My Ads Tab */}
          <button
            onClick={() => navigate('/my-ads')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isMyAds ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Grid className="h-5.5 w-5.5" />
            <span className="text-[10px] font-semibold mt-0.5">{getTranslation(language, 'myAds')}</span>
          </button>

          {/* Account Tab */}
          <button
            onClick={() => navigate('/account')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isAccount ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <User className="h-5.5 w-5.5" />
            <span className="text-[10px] font-semibold mt-0.5">{getTranslation(language, 'account')}</span>
          </button>

        </div>
      </nav>

      {/* Desktop Navigation Link-Bar (Hidden on Mobile) */}
      <div className="hidden border-b border-gray-100 bg-gray-50/70 py-3 md:block" id="desktop-navbar">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                isHome 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>{getTranslation(language, 'home')}</span>
            </button>

            <button
              onClick={() => navigate('/messages')}
              className={`relative flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                isMessages 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{getTranslation(language, 'messages')}</span>
              {unreadChats > 0 && (
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                  isMessages ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                }`}>
                  {unreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/my-ads')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                isMyAds 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>{getTranslation(language, 'myAds')}</span>
            </button>

            <button
              onClick={() => navigate('/account')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                isAccount 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <User className="h-4 w-4" />
              <span>{getTranslation(language, 'account')}</span>
            </button>
          </div>

          {/* Desktop Right side CTA button */}
          <button
            onClick={handlePublish}
            className="flex items-center space-x-2 rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-100 hover:bg-orange-600 hover:shadow-none transition-all active:scale-95"
            id="desktop-publish-btn"
          >
            <Plus className="h-4 w-4" />
            <span>{getTranslation(language, 'publishTitle')}</span>
          </button>
        </div>
      </div>
    </>
  );
};
