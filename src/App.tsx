import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { getTranslation } from './utils/translations';
import { WifiOff } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppRouter } from './router';

import { LayoutProvider } from './components/LayoutProvider';

function AppContent() {
  const {
    language,
    isOffline,
  } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-10 font-sans flex flex-col" id="app-root">
      <ConnectionBanner />
      {/* Primary Header */}
      <Header />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 flex-grow w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <AppRouter location={location} />
        </AnimatePresence>
      </main>

      <Footer />

    </div>
  );
}

import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { ConnectionBanner } from './components/feedback/ConnectionBanner';
import { TutorialTour } from './components/TutorialTour';
import { AppProviders } from './providers/AppProviders';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppProviders>
          <AppProvider>
            <LayoutProvider>
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
                <TutorialTour />
              </BrowserRouter>
            </LayoutProvider>
          </AppProvider>
        </AppProviders>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
