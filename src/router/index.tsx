import React, { lazy, Suspense } from 'react';
import { Routes, Route, Location } from 'react-router-dom';
import { AppRoutes } from './types';
import { AuthGuard } from './AuthGuard';
import { HomePage } from '../pages/HomePage'; // Eager load

// Re-export AppRoutes for ease of use
export { AppRoutes };

// @lazy
const CategoryPage = lazy(() => import('../pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
// @lazy
const AdDetailPage = lazy(() => import('../pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
// @lazy
const SearchResultsPage = lazy(() => import('../pages/SearchPage').then(m => ({ default: m.SearchPage })));
// @lazy
const PostAdPage = lazy(() => import('../pages/PublishPage').then(m => ({ default: m.PublishPage })));
// @lazy
const MyAdsPage = lazy(() => import('../pages/MyAdsPage').then(m => ({ default: m.MyAdsPage })));
// @lazy
const MessagesPage = lazy(() => import('../pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
// @lazy
const FavoritesPage = lazy(() => import('../pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
// @lazy
const PublicProfilePage = lazy(() => import('../pages/SellerProfilePage').then(m => ({ default: m.SellerProfilePage })));
// @lazy
const MyProfilePage = lazy(() => import('../pages/AccountPage').then(m => ({ default: m.AccountPage })));

// Expose preload function for CategoryPage
export const preloadCategoryPage = () => {
  const p = import('../pages/CategoryPage');
};

const SkeletonFallback = () => (
  <div className="w-full h-64 animate-pulse bg-surface-hover rounded-xl flex items-center justify-center border border-border-color">
    <div className="w-12 h-12 rounded-full bg-border-color opacity-50"></div>
  </div>
);

interface AppRouterProps {
  location: Location;
}

export const AppRouter: React.FC<AppRouterProps> = ({ location }) => {
  return (
    <Suspense fallback={<SkeletonFallback />}>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path={AppRoutes.HOME} element={<HomePage />} />
        <Route path={AppRoutes.CATEGORY} element={<CategoryPage />} />
        <Route path={AppRoutes.SUBCATEGORY} element={<CategoryPage />} />
        <Route path={AppRoutes.AD_DETAIL} element={<AdDetailPage />} />
        <Route path={AppRoutes.SEARCH} element={<SearchResultsPage />} />
        <Route path={AppRoutes.PUBLIC_PROFILE} element={<PublicProfilePage />} />

        {/* Protected Routes */}
        <Route path={AppRoutes.POST_AD} element={<AuthGuard><PostAdPage /></AuthGuard>} />
        <Route path={AppRoutes.MY_ADS} element={<AuthGuard><MyAdsPage /></AuthGuard>} />
        <Route path={AppRoutes.MESSAGES} element={<AuthGuard><MessagesPage /></AuthGuard>} />
        <Route path={AppRoutes.CONVERSATION} element={<AuthGuard><MessagesPage /></AuthGuard>} />
        <Route path={AppRoutes.FAVORITES} element={<AuthGuard><FavoritesPage /></AuthGuard>} />
        <Route path={AppRoutes.MY_PROFILE} element={<AuthGuard><MyProfilePage /></AuthGuard>} />
      </Routes>
    </Suspense>
  );
};
