import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { PublishPage } from './pages/PublishPage';
import { MessagesPage } from './pages/MessagesPage';
import { MyAdsPage } from './pages/MyAdsPage';
import { AccountPage } from './pages/AccountPage';
import { getTranslation } from './utils/translations';
import { WifiOff } from 'lucide-react';

function AppContent() {
  const {
    language,
    isOffline,
  } = useApp();

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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 flex-grow w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/publish" element={<PublishPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/my-ads" element={<MyAdsPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </main>

      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
