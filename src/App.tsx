import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PageLoader } from './components/PageLoader';
import { getTranslation } from './utils/translations';
import { WifiOff } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage').then(module => ({ default: module.ListingDetailPage })));
const PublishPage = lazy(() => import('./pages/PublishPage').then(module => ({ default: module.PublishPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(module => ({ default: module.MessagesPage })));
const MyAdsPage = lazy(() => import('./pages/MyAdsPage').then(module => ({ default: module.MyAdsPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(module => ({ default: module.AccountPage })));

function AppContent() {
  const {
    language,
    isOffline,
  } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-10 font-sans flex flex-col" id="app-root">
      
      {/* Offline graceful fallback banner */}
      {isOffline && (
        <div className="flex items-center justify-center space-x-2.5 bg-amber-500 py-2.5 px-4 text-xs font-bold text-white shadow-md animate-bounce shrink-0" id="offline-banner">
          <WifiOff className="h-4.5 w-4.5" />
          <span>{getTranslation(language, 'offlineMode')}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header />

      {/* Dual Nav Link Bar */}
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 flex-grow w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/publish" element={<PublishPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/my-ads" element={<MyAdsPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      <Footer />

    </div>
  );
}

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppProvider>
          <BrowserRouter>
            <AppContent />
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                  fontSize: '13px',
                  borderRadius: '12px',
                  padding: '10px 16px',
                },
                success: {
                  style: {
                    background: '#10B981',
                    color: '#fff',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                    color: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
        </AppProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
