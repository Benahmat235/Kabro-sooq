import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { CATEGORIES, CITIES } from '../data/mockData';
import { CategoryType, ConditionType, Listing, isCategoryOrAll, isConditionOrAll } from '../types';
import { SkeletonGrid } from './SkeletonCard';
import { ListingCard } from './ListingCard';
import { PriceRangeSlider } from './PriceRangeSlider';
import { FilterButton } from './ui/FilterButton';
import { Select } from './ui/Select';
import { 
  Search, SlidersHorizontal, AlertTriangle, Car, Home as HomeIcon, 
  Smartphone, Briefcase, Wrench, PawPrint, Grid3X3, MapPin, Heart,
  Tv, Shirt, Sofa, ChevronRight
} from 'lucide-react';

interface HomeTabProps {
  onQuickView: (listing: Listing) => void;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Moussoro": { lat: 13.64, lng: 16.49 },
  "Ati": { lat: 13.21, lng: 18.33 },
  "Faya-Largeau": { lat: 17.93, lng: 19.11 },
  "Massenya": { lat: 12.05, lng: 16.17 },
  "Amdjarass": { lat: 16.07, lng: 22.84 },
  "Fada": { lat: 17.18, lng: 21.58 },
  "Mongo": { lat: 12.18, lng: 18.69 },
  "Massakory": { lat: 13.00, lng: 15.73 },
  "Mao": { lat: 14.12, lng: 15.31 },
  "Bol": { lat: 13.46, lng: 14.71 },
  "Moundou": { lat: 8.57, lng: 16.08 },
  "Doba": { lat: 8.65, lng: 16.85 },
  "Koumra": { lat: 8.91, lng: 17.55 },
  "Bongor": { lat: 10.28, lng: 15.37 },
  "Pala": { lat: 9.36, lng: 14.90 },
  "Sarh": { lat: 9.14, lng: 18.39 },
  "Abéché": { lat: 13.83, lng: 20.83 },
  "Am Timan": { lat: 11.04, lng: 20.28 },
  "Goz Beïda": { lat: 12.22, lng: 21.41 },
  "Laï": { lat: 9.40, lng: 16.30 },
  "Bardaï": { lat: 21.35, lng: 17.00 },
  "N'Djaména": { lat: 12.11, lng: 15.05 },
  "Biltine": { lat: 14.53, lng: 20.92 }
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const CAR_BRANDS: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "Hilux", "RAV4", "Land Cruiser", "Yaris"],
  Hyundai: ["Elantra", "Tucson", "Santa Fe", "Accent", "Sonata"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot"],
  Ford: ["Ranger", "F-150", "Everest", "Escape"],
  Nissan: ["Patrol", "Navara", "Altima", "Sentra"],
  Mercedes: ["C-Class", "E-Class", "G-Class", "GLE"],
  BMW: ["3 Series", "5 Series", "X3", "X5"]
};

export const HomeTab: React.FC<HomeTabProps> = ({ onQuickView }) => {
  const { language, selectedCity, setSelectedCity, listings, loadingListings, user, savedListings } = useApp();

  const maxPriceLimit = useMemo(() => {
    if (!listings || listings.length === 0) return 50000000;
    const maxVal = Math.max(...listings.map(l => l.price || 0));
    // Round up to nearest 1,000,000 for a clean slider maximum
    return maxVal > 0 ? Math.ceil(maxVal / 1000000) * 1000000 : 50000000;
  }, [listings]);

  const priceSliderStep = useMemo(() => {
    if (maxPriceLimit <= 1000000) return 10000;
    if (maxPriceLimit <= 5000000) return 50000;
    if (maxPriceLimit <= 20000000) return 100000;
    return 250000;
  }, [maxPriceLimit]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | 'all'>('all');

  const handleCategoryChange = (category: CategoryType | 'all') => {
    setActiveCategory(category);
    setActiveSubcategory('all');
  };
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [selectedCondition, setSelectedCondition] = useState<ConditionType | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [filterToday, setFilterToday] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [sortOption, setSortOption] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'distance' | 'trending'>('newest');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && isCategoryOrAll(cat)) {
      handleCategoryChange(cat as CategoryType);
    }
  }, [location.search]);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setSortOption('distance');
        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation warning:", error.message);
        let msg = "Impossible d'accéder à votre position. Veuillez autoriser la localisation.";
        if (error.code === 1) { // PERMISSION_DENIED
          msg = "Accès à la localisation refusé. Veuillez activer les permissions de localisation dans votre navigateur ou ouvrir l'application dans un nouvel onglet.";
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          msg = "La position est indisponible sur cet appareil.";
        } else if (error.code === 3) { // TIMEOUT
          msg = "La demande de localisation a expiré. Veuillez réessayer.";
        }
        setGeoError(msg);
        setIsLocating(false);
        setSortOption('newest'); // fallback
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const getListingDistance = (listing: Listing): number => {
    if (!userCoords) return 99999;
    const coords = CITY_COORDINATES[listing.city];
    if (!coords) return 99999;
    return getDistance(userCoords.lat, userCoords.lng, coords.lat, coords.lng);
  };

  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return { categories: [], listings: [], cities: [] };
    }
    const query = searchQuery.toLowerCase();

    const matchedCategories = CATEGORIES.filter(cat =>
      cat.name.toLowerCase().includes(query)
    );

    const matchedListings = listings.filter(item =>
      item.status === 'active' &&
      (item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
    ).slice(0, 5);

    const matchedCities = CITIES.filter(city =>
      city.toLowerCase().includes(query)
    ).slice(0, 4);

    return {
      categories: matchedCategories,
      listings: matchedListings,
      cities: matchedCities,
    };
  }, [searchQuery, listings]);

  const activeCategoriesList = useMemo(() => {
    return CATEGORIES.filter(cat => 
      listings.some(l => l.category === cat.name && l.status === 'active')
    );
  }, [listings]);

  const hasSuggestions = useMemo(() => {
    const { categories, listings, cities } = autocompleteSuggestions;
    return categories.length > 0 || listings.length > 0 || cities.length > 0;
  }, [autocompleteSuggestions]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Car className="h-5 w-5" />;
      case 'Home': return <HomeIcon className="h-5 w-5" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5" />;
      case 'Briefcase': return <Briefcase className="h-5 w-5" />;
      case 'Wrench': return <Wrench className="h-5 w-5" />;
      case 'PawPrint': return <PawPrint className="h-5 w-5" />;
      case 'Tv': return <Tv className="h-5 w-5" />;
      case 'Shirt': return <Shirt className="h-5 w-5" />;
      case 'Sofa': return <Sofa className="h-5 w-5" />;
      default: return <Grid3X3 className="h-5 w-5" />;
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (item.status === 'archived') return false;
      if (showOnlyFavorites) {
        if (!savedListings || !savedListings.includes(item.id)) return false;
      }
      if (filterToday) {
        const itemDate = new Date(item.createdAt);
        const today = new Date();
        if (itemDate.toDateString() !== today.toDateString()) return false;
      }
      if (selectedCity !== 'all' && item.city !== selectedCity) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (activeSubcategory !== 'all' && item.subcategory !== activeSubcategory) return false;
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false;
      if (priceMin !== '' && item.price < priceMin) return false;
      if (priceMax !== '' && item.price > priceMax) return false;

      // Brand and Model filtering for Vehicles
      if (activeCategory === 'Véhicules') {
        const textToSearch = `${item.title} ${item.description}`.toLowerCase();
        if (selectedBrand !== 'all' && !textToSearch.includes(selectedBrand.toLowerCase())) return false;
        if (selectedModel !== 'all' && !textToSearch.includes(selectedModel.toLowerCase())) return false;
      }

      return true;
    });
  }, [listings, selectedCity, searchQuery, activeCategory, activeSubcategory, selectedCondition, priceMin, priceMax, showOnlyFavorites, filterToday, savedListings, selectedBrand, selectedModel]);

  const trendingListings = useMemo(() => {
    return listings
      .filter(l => l.status === 'active')
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, 5);
  }, [listings]);

  const sortedListings = useMemo(() => {
    const list = [...filteredListings];
    list.sort((a, b) => {
      // Always put premium listings first
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;

      if (sortOption === 'priceAsc') {
        return a.price - b.price;
      } else if (sortOption === 'priceDesc') {
        return b.price - a.price;
      } else if (sortOption === 'trending') {
        return b.viewsCount - a.viewsCount;
      } else if (sortOption === 'distance' && userCoords) {
        const distA = getListingDistance(a);
        const distB = getListingDistance(b);
        return distA - distB;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [filteredListings, sortOption, userCoords]);

  const hasFiltersActive = activeCategory !== 'all' || activeSubcategory !== 'all' || searchQuery !== '' || priceMin !== '' || priceMax !== '' || selectedCondition !== 'all' || showOnlyFavorites || filterToday || selectedCity !== 'all' || sortOption !== 'newest';

  return (
    <div className="space-y-6 sm:space-y-10" id="home-view">
      
      {/* 1. Large Search & City Auto-complete section */}
      <div className="relative rounded-3xl bg-gradient-to-tr from-primary-700 to-primary-900 px-6 py-10 text-center shadow-xl md:py-14 shrink-0 overflow-hidden" id="hero-search-box">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {getTranslation(language, 'tagline')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-medium text-primary-100">
            Achetez, vendez et échangez en toute confiance au Tchad.
          </p>

          <div className="relative mt-6 sm:mt-8">
            <div className="flex rounded-2xl bg-white p-1.5 shadow-lg shadow-black/10">
              <div className="flex flex-1 items-center px-3.5">
                <Search className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={getTranslation(language, 'searchPlaceholder')}
                  aria-label={getTranslation(language, 'searchPlaceholder')}
                  className="w-full border-none bg-transparent px-3 text-sm font-semibold text-gray-800 focus:outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-label="Afficher ou masquer les filtres de recherche"
                className={`flex h-11 items-center space-x-1.5 rounded-xl px-4 text-xs font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 ${showFilters ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{getTranslation(language, 'filter')}</span>
              </button>
            </div>

            {showSuggestions && hasSuggestions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl text-left z-20 max-h-[420px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                  
                  {/* Category Suggestions */}
                  {autocompleteSuggestions.categories.length > 0 && (
                    <div id="suggested-categories">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 mb-1.5">Catégories</h5>
                      <div className="space-y-0.5">
                        {autocompleteSuggestions.categories.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => {
                              handleCategoryChange(cat.name);
                              setSearchQuery('');
                              setShowSuggestions(false);
                            }}
                            className="w-full rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center space-x-2.5"
                          >
                            <span className="text-gray-400 shrink-0">
                              {getCategoryIcon(cat.icon)}
                            </span>
                            <span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* City Suggestions */}
                  {autocompleteSuggestions.cities.length > 0 && (
                    <div id="suggested-cities">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 mb-1.5">Villes</h5>
                      <div className="space-y-0.5">
                        {autocompleteSuggestions.cities.map((citySuggestion) => (
                          <button
                            key={citySuggestion}
                            onClick={() => {
                              setSelectedCity(citySuggestion);
                              setSearchQuery('');
                              setShowSuggestions(false);
                            }}
                            className={`w-full rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 flex items-center space-x-2.5 ${
                              selectedCity === citySuggestion
                                ? 'bg-primary-50 text-primary-700 font-bold'
                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                            }`}
                          >
                            <span className="text-primary-500 text-sm shrink-0">
                              <MapPin className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span>{citySuggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Listing Suggestions */}
                  {autocompleteSuggestions.listings.length > 0 && (
                    <div id="suggested-listings">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 mb-1.5">Annonces</h5>
                      <div className="space-y-0.5">
                        {autocompleteSuggestions.listings.map((item) => (
                          <div
                            key={item.id}
                            className="group flex items-center justify-between rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <button
                              onClick={() => {
                                setSearchQuery(item.title);
                                setShowSuggestions(false);
                              }}
                              className="flex items-center space-x-3 text-left flex-1 min-w-0"
                            >
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt=""
                                  className="h-8 w-11 object-cover rounded bg-gray-100 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-8 w-11 bg-gray-100 rounded shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">{item.title}</p>
                                <div className="flex items-center space-x-1 text-[10px] text-gray-500 mt-0.5 font-semibold">
                                  <span>{item.city}</span>
                                  <span>•</span>
                                  <span className="text-primary-600 font-bold">{item.price.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                              </div>
                            </button>
                            
                            {/* Direct Quick View button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickView(item);
                                setShowSuggestions(false);
                              }}
                              className="ml-2 text-[10px] font-black text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg px-2 py-1.5 shrink-0 border border-transparent hover:border-primary-100 transition-all active:scale-95"
                            >
                              Aperçu
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Breadcrumbs for Category Page */}
      {activeCategory !== 'all' && (
        <div className="flex flex-wrap items-center space-x-2 text-[11px] font-semibold text-gray-500 mb-2 px-2">
          <button 
            onClick={() => {
              handleCategoryChange('all');
              setSearchQuery('');
            }}
            className="hover:text-primary-600 transition-colors"
          >
            Accueil
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">{activeCategory}</span>
        </div>
      )}

      {/* 2.5 Collapsible Filters Drawer */}
      {showFilters && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-in slide-in-from-top-4 duration-200" id="filters-drawer">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-50">
            <h4 className="text-sm font-bold text-gray-800">{getTranslation(language, 'filter')}</h4>
            <button 
              onClick={() => {
                setPriceMin('');
                setPriceMax('');
                setSelectedCondition('all');
                handleCategoryChange('all');
                setSelectedBrand('all');
                setSelectedModel('all');
              }}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              {getTranslation(language, 'clearFilters')}
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1.5">Budget (FCFA)</label>
              <PriceRangeSlider
                min={priceMin}
                max={priceMax}
                minLimit={0}
                maxLimit={maxPriceLimit}
                step={priceSliderStep}
                onChange={(minVal, maxVal) => {
                  setPriceMin(minVal);
                  setPriceMax(maxVal);
                }}
              />
            </div>

            <Select
              label={getTranslation(language, 'condition')}
              value={selectedCondition}
              onChange={(e) => {
                const val = e.target.value;
                if (isConditionOrAll(val)) {
                  setSelectedCondition(val);
                }
              }}
            >
              <option value="all">{getTranslation(language, 'selectCondition')}</option>
              <option value="new">{getTranslation(language, 'new')}</option>
              <option value="excellent">{getTranslation(language, 'excellent')}</option>
              <option value="good">{getTranslation(language, 'good')}</option>
              <option value="used">{getTranslation(language, 'used')}</option>
            </Select>

            <Select
              label={getTranslation(language, 'category')}
              value={activeCategory}
              onChange={(e) => {
                const val = e.target.value;
                if (isCategoryOrAll(val)) {
                  handleCategoryChange(val);
                  setSelectedBrand('all');
                  setSelectedModel('all');
                }
              }}
            >
              <option value="all">{getTranslation(language, 'allCategories')}</option>
              {activeCategoriesList.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </Select>
          </div>

          {activeCategory === 'Véhicules' && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans border-t border-gray-50 pt-4">
              <Select
                label="Marque"
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('all'); // Reset model when brand changes
                }}
              >
                <option value="all">Toutes les marques</option>
                {Object.keys(CAR_BRANDS).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </Select>

              <Select
                label="Modèle"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={selectedBrand === 'all'}
              >
                <option value="all">Tous les modèles</option>
                {selectedBrand !== 'all' && CAR_BRANDS[selectedBrand]?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      {/* 3. Category Hub Grid */}
      <div className="mt-6" id="category-hub">
        <h3 className="text-base font-bold text-gray-900 tracking-tight mb-4">
          {getTranslation(language, 'allCategories')}
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all ${
              activeCategory === 'all'
                ? 'bg-primary/5 border-primary text-primary shadow-sm border-2'
                : 'bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-200 border-2 shadow-sm'
            }`}
          >
            <div className={`p-3 rounded-full mb-2.5 transition-colors ${activeCategory === 'all' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
              <Grid3X3 className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-center">Tous</span>
          </button>
          
          {activeCategoriesList.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all ${
                activeCategory === cat.name
                  ? 'bg-primary/5 border-primary text-primary shadow-sm border-2'
                  : 'bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-200 border-2 shadow-sm'
              }`}
            >
              <div className={`p-3 rounded-full mb-2.5 transition-colors ${activeCategory === cat.name ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-center">{cat.name}</span>
            </button>
          ))}
        </div>

        {activeCategory !== 'all' && CATEGORIES.find(c => c.name === activeCategory)?.subcategories && (
          <div className="mt-4 flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
            <button
              onClick={() => setActiveSubcategory('all')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeSubcategory === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous dans {activeCategory}
            </button>
            {CATEGORIES.find(c => c.name === activeCategory)?.subcategories?.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeSubcategory === sub 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Trending Listings horizontal carousel */}
      {trendingListings.length > 0 && activeCategory === 'all' && searchQuery === '' && (
        <div className="space-y-3.5 shrink-0" id="trending-ads-carousel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 tracking-tight">{getTranslation(language, 'featuredAds')}</h3>
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
            {trendingListings.map((trending) => (
              <div key={trending.id} className="w-[260px] sm:w-[280px] shrink-0">
                <ListingCard listing={trending} onQuickView={onQuickView} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Main infinite scroll lists grid */}
      <div className="space-y-4" id="ads-listings-list">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-800 tracking-tight shrink-0">
            {getTranslation(language, 'latestAds')}
            {selectedCity !== 'all' && ` - ${selectedCity}`}
          </h3>

          {/* Elegant Sort Buttons */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Critères de tri">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider mr-1">Trier par :</span>
            
            {user && (
              <FilterButton
                size="sm"
                variant="orange"
                active={showOnlyFavorites}
                onClick={() => {
                  setShowOnlyFavorites(!showOnlyFavorites);
                  setGeoError(null);
                }}
                className="mr-1"
              >
                <Heart className={`h-3 w-3 shrink-0 ${showOnlyFavorites ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} aria-hidden="true" />
                <span>Mes Favoris ({savedListings?.length || 0})</span>
              </FilterButton>
            )}

            <FilterButton
              size="sm"
              active={filterToday}
              onClick={() => {
                setFilterToday(!filterToday);
                setGeoError(null);
              }}
              className="mr-1 border-primary-200"
            >
              Nouveau Aujourd'hui
            </FilterButton>
            
            <FilterButton
              size="sm"
              active={sortOption === 'newest'}
              onClick={() => {
                setSortOption('newest');
                setGeoError(null);
              }}
            >
              Nouveautés
            </FilterButton>

            <FilterButton
              size="sm"
              active={sortOption === 'trending'}
              onClick={() => {
                setSortOption('trending');
                setGeoError(null);
              }}
            >
              Tendance
            </FilterButton>

            <FilterButton
              size="sm"
              active={sortOption === 'priceAsc'}
              onClick={() => {
                setSortOption('priceAsc');
                setGeoError(null);
              }}
            >
              Prix bas
            </FilterButton>

            <FilterButton
              size="sm"
              active={sortOption === 'priceDesc'}
              onClick={() => {
                setSortOption('priceDesc');
                setGeoError(null);
              }}
            >
              Prix élevé
            </FilterButton>

            <FilterButton
              size="sm"
              variant="orange"
              active={sortOption === 'distance'}
              disabled={isLocating}
              onClick={() => {
                if (userCoords) {
                  setSortOption('distance');
                  setGeoError(null);
                } else {
                  requestGeolocation();
                }
              }}
              className={isLocating ? 'opacity-70 cursor-not-allowed' : ''}
            >
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{isLocating ? 'Recherche...' : 'Proximité'}</span>
            </FilterButton>
          </div>
        </div>

        {geoError && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-3.5 flex items-start space-x-2.5 text-xs text-red-700 animate-in fade-in duration-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Localisation indisponible : </span>
              <span>{geoError}</span>
            </div>
            <button 
              onClick={() => setGeoError(null)}
              className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-wider shrink-0"
            >
              Ignorer
            </button>
          </div>
        )}

        {loadingListings ? (
          <SkeletonGrid />
        ) : sortedListings.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">{getTranslation(language, 'noAdsFound')}</h4>
            <button 
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
                setSelectedCity('all');
                setPriceMin('');
                setPriceMax('');
                setSelectedCondition('all');
                setSelectedBrand('all');
                setSelectedModel('all');
                setSortOption('newest');
                setGeoError(null);
              }}
              className="mt-4 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary-200"
            >
              Effacer les filtres
            </button>
          </div>
        ) : !hasFiltersActive ? (
          <div className="space-y-10">
            {activeCategoriesList.map(cat => {
              const catListings = sortedListings.filter(l => l.category === cat.name).slice(0, 4);
              if (catListings.length === 0) return null;
              
              return (
                <div key={cat.name} className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <h3 className="text-sm font-bold text-gray-800 tracking-tight">{cat.name}</h3>
                    </div>
                    <button 
                      onClick={() => handleCategoryChange(cat.name)}
                      className="flex items-center space-x-1 text-[11px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider"
                    >
                      <span>Voir Tout</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {catListings.map(listing => (
                      <div key={listing.id} className="w-[240px] sm:w-[260px] shrink-0">
                        <ListingCard listing={listing} onQuickView={onQuickView} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {sortedListings.map((listing) => {
              const distance = sortOption === 'distance' ? getListingDistance(listing) : undefined;
              return (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onQuickView={onQuickView}
                  distance={distance !== undefined && distance !== 99999 ? distance : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
