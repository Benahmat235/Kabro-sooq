import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { CITIES, MOCK_WEATHER, CATEGORIES } from '../data/mockData';
import { loginWithGoogle, logout } from '../lib/firebase';
import { CloudSun, Globe, User, LogOut, MapPin, LogIn, ChevronDown, Search, Check } from 'lucide-react';
import { CityType, LanguageType } from '../types';
import tchadData from '../data/tchadData.json';
import { CitySelector } from './ui/CitySelector';

const LANGUAGES: LanguageType[] = ['FR', 'AR', 'EN'];

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    selectedCity,
    setSelectedCity,
    user,
    loadingAuth,
    isOffline,
    listings
  } = useApp();

  const [langOpen, setLangOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const navigate = useNavigate();

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  const currentWeather = (selectedCity !== 'all' 
    ? MOCK_WEATHER[selectedCity] 
    : MOCK_WEATHER["N'Djaména"]) || { temp: 37, condition: "Ensoleillé" };

  const getRegionForCity = (city: string) => {
    const r = tchadData.tchad.regions.find(reg => reg.chef_lieu === city);
    return r ? r.nom : '';
  };

  const getListingCountForCity = (city: string) => {
    if (!listings) return 0;
    return listings.filter(l => l.city === city && l.status === 'active').length;
  };

  const totalActiveListings = listings ? listings.filter(l => l.status === 'active').length : 0;

  const filteredDropdownCities = useMemo(() => {
    if (!globalSearchQuery) return CITIES;
    return CITIES.filter(city => 
      city.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      getRegionForCity(city).toLowerCase().includes(globalSearchQuery.toLowerCase())
    );
  }, [globalSearchQuery, listings]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error("Login failed in Header: ", e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm" id="main-header" role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 font-bold text-white shadow-md shadow-primary-200" aria-hidden="true">
            KS
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 font-sans">
              {getTranslation(language, 'logo')}
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider -mt-0.5">
              {getTranslation(language, 'tagline').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <div className="flex w-full items-center rounded-2xl bg-gray-50 border border-gray-100 px-3.5 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white transition-all">
            <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setGlobalSearchOpen(true); // Open suggestions
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearchQuery.trim()) {
                  addRecentSearch(globalSearchQuery.trim());
                  // Optionally navigate to a search results page here if implemented
                  setGlobalSearchOpen(false);
                }
              }}
              onFocus={() => setGlobalSearchOpen(true)}
              placeholder="Rechercher des annonces, catégories ou villes..."
              className="w-full bg-transparent px-3 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>
          
          {globalSearchOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setGlobalSearchOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl z-20 max-h-[420px] overflow-y-auto p-2">
                
                {/* Recent Searches */}
                {!globalSearchQuery && recentSearches.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-400">Recherches récentes</span>
                      <button 
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recentSearches');
                        }}
                        className="text-[10px] text-primary-500 hover:text-primary-600 font-bold"
                      >
                        Effacer
                      </button>
                    </div>
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => {
                          setGlobalSearchQuery(search);
                        }}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {globalSearchQuery && CATEGORIES.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400">Catégories</div>
                    {CATEGORIES.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3).map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          addRecentSearch(cat.name);
                          navigate(`/?category=${cat.name}`);
                          setGlobalSearchQuery('');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {globalSearchQuery && filteredDropdownCities.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400">Villes</div>
                    {filteredDropdownCities.slice(0, 3).map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          addRecentSearch(city);
                          setSelectedCity(city);
                          setGlobalSearchQuery('');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <MapPin className="h-3.5 w-3.5 text-primary-500" />
                          <span>{city}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                
                {globalSearchQuery && listings?.filter(l => l.status === 'active' && l.title.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 4).length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400">Annonces</div>
                    {listings.filter(l => l.status === 'active' && l.title.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 4).map((listing) => (
                      <button
                        key={listing.id}
                        onClick={() => {
                          addRecentSearch(listing.title);
                          navigate(`/listing/${listing.id}`);
                          setGlobalSearchQuery('');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 rounded-xl px-3 py-2 text-left hover:bg-gray-50"
                      >
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} className="h-8 w-11 object-cover rounded bg-gray-100" alt="" />
                        ) : (
                          <div className="h-8 w-11 bg-gray-100 rounded" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{listing.title}</p>
                          <p className="text-[10px] text-primary-600 font-bold">{listing.price.toLocaleString()} FCFA</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dynamic Context (City & Weather) */}
        <div className="flex items-center space-x-4">
          
          {/* City Selector */}
          <CitySelector
            selectedCity={selectedCity}
            onSelect={(city) => setSelectedCity(city)}
            listingCounts={listings?.filter(l => l.status === 'active').reduce((acc, l) => {
              acc[l.city] = (acc[l.city] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)}
            totalActiveListings={totalActiveListings}
            allCitiesLabel={getTranslation(language, 'allCities')}
          />

          {/* Local Weather */}
          <div className="hidden md:flex items-center space-x-2 rounded-full border border-primary-100 bg-primary-50/50 px-3.5 py-1.5 text-xs text-primary-800" aria-label={`Météo actuelle : ${selectedCity === 'all' ? "N'Djaména" : selectedCity}, ${currentWeather.temp} degrés, ${currentWeather.condition}`}>
            <CloudSun className="h-4 w-4 text-primary-500 animate-pulse" aria-hidden="true" />
            <span className="font-mono font-medium">
              {selectedCity === 'all' ? "N'Djaména" : selectedCity}: {currentWeather.temp}°C
            </span>
            <span className="text-primary-600 font-sans text-[10px] font-semibold">
              ({currentWeather.condition})
            </span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-haspopup="true"
              aria-expanded={langOpen}
              aria-label="Sélectionner la langue"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-gray-100"
              id="lang-selector-btn"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-32 rounded-2xl border border-gray-100 bg-white p-1 shadow-xl z-20" role="dialog" aria-label="Sélection de langue">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                      }}
                      className={`w-full text-center rounded-xl px-3 py-1.5 text-xs font-bold ${language === lang ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {lang === 'FR' ? 'Français' : lang === 'AR' ? 'العربية' : 'English'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Auth Button */}
          {!loadingAuth && (
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-2.5">
                  <div className="relative group">
                    <button
                      aria-label="Menu profil utilisateur"
                      aria-haspopup="true"
                      className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full block"
                    >
                      <img 
                        src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                        alt={user.displayName || "User"} 
                        className="h-10 w-10 rounded-full border-2 border-primary-100 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                    <div className="absolute right-0 mt-2 hidden group-hover:block group-focus-within:block w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-30">
                      <p className="px-3 py-1.5 text-[10px] text-gray-500 font-semibold truncate border-b border-gray-50">
                        {user.email}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{getTranslation(language, 'signOutBtn')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  aria-label="Se connecter avec Google"
                  className="flex items-center space-x-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary-200 hover:bg-primary-700 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  id="google-signin-btn"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{getTranslation(language, 'signInBtn')}</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
