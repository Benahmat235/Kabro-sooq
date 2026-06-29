import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/ListingCard';
import { AppRoutes } from '../router';
import { SearchX, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const CategoryPage: React.FC = () => {
  const { slug, sub } = useParams<{ slug: string; sub?: string }>();
  const { listings, loadingListings } = useApp();
  const navigate = useNavigate();

  const results = useMemo(() => {
    let filtered = listings.filter(l => l.status === 'active');
    
    if (slug) {
      filtered = filtered.filter(l => l.category.toLowerCase() === slug.toLowerCase());
    }
    
    if (sub) {
      filtered = filtered.filter(l => l.subcategory?.toLowerCase() === sub.toLowerCase());
    }
    
    return filtered;
  }, [listings, slug, sub]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
    >
      <div className="mb-6 flex items-center space-x-4">
        <button 
          onClick={() => navigate(AppRoutes.HOME)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 capitalize">
            {sub || slug}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {results.length} annonce{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loadingListings ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <SearchX className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-gray-800">Aucun résultat</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Nous n'avons trouvé aucune annonce dans cette catégorie.
          </p>
          <button 
            onClick={() => navigate(AppRoutes.HOME)}
            className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700 transition-all"
          >
            Découvrir d'autres annonces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {results.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onQuickView={(l) => navigate(AppRoutes.AD_DETAIL.replace(':id', l.id))} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
