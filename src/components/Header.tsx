import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { CITIES, MOCK_WEATHER } from '../data/mockData';
import { loginWithGoogle, logout } from '../lib/firebase';
import { CloudSun, Globe, User, LogOut, MapPin, LogIn, ChevronDown, Search, Check } from 'lucide-react';
import { CityType, LanguageType } from '../types';
import tchadData from '../data/tchadData.json';

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
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

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
    if (!citySearchQuery) return CITIES;
    return CITIES.filter(city => 
      city.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
      getRegionForCity(city).toLowerCase().includes(citySearchQuery.toLowerCase())
    );
  }, [citySearchQuery, listings]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert("Erreur de connexion. Veuillez réessayer.");
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
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm" id="main-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200">
            KS
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 font-sans">
              {getTranslation(language, 'logo')}
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider -mt-0.5">
              {getTranslation(language, 'tagline').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Dynamic Context (City & Weather) */}
        <div className="flex items-center space-x-4">
          
          {/* City Selector */}
          <div className="relative">
            <button
              onClick={() => setCityOpen(!cityOpen)}
              className="flex items-center space-x-1.5 rounded-full bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              id="city-selector-btn"
            >
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>
                {selectedCity === 'all' 
                  ? getTranslation(language, 'allCities') 
                  : selectedCity}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {cityOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => {
                  setCityOpen(false);
                  setCitySearchQuery('');
                }} />
                <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-gray-100 bg-white shadow-2xl z-20 overflow-hidden divide-y divide-gray-50/80 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search box inside the city dropdown */}
                  <div className="p-3 bg-gray-50/30 flex items-center space-x-2">
                    <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Rechercher une ville ou région..."
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                    {citySearchQuery && (
                      <button 
                        onClick={() => setCitySearchQuery('')} 
                        className="text-[10px] text-gray-400 hover:text-gray-600 font-black"
                      >
                        Vider
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                    {!citySearchQuery && (
                      <button
                        onClick={() => {
                          setSelectedCity('all');
                          setCityOpen(false);
                          setCitySearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors ${
                          selectedCity === 'all' 
                            ? 'bg-blue-50 text-blue-700 font-bold' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center space-x-2 font-bold">
                          <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>{getTranslation(language, 'allCities')}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="rounded-lg bg-blue-100/50 px-1.5 py-0.5 text-[9px] font-black text-blue-600 font-mono">
                            {totalActiveListings}
                          </span>
                          {selectedCity === 'all' && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                        </div>
                      </button>
                    )}

                    {filteredDropdownCities.map((city) => {
                      const regionName = getRegionForCity(city);
                      const isSelected = selectedCity === city;
                      const count = getListingCountForCity(city);
                      return (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setCityOpen(false);
                            setCitySearchQuery('');
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 text-blue-700 font-bold' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-bold text-gray-800 truncate">{city}</span>
                            <span className="text-[9px] text-gray-400 font-semibold truncate mt-0.5">
                              {regionName ? `Région : ${regionName}` : 'Tchad'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            {count > 0 ? (
                              <span className="rounded-lg bg-orange-100/60 px-1.5 py-0.5 text-[9px] font-black text-orange-600 font-mono">
                                {count} {count === 1 ? 'annonce' : 'annonces'}
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-300 font-bold font-mono">
                                0
                              </span>
                            )}
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}

                    {filteredDropdownCities.length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-400 font-medium">
                        Aucune ville ou région trouvée
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Local Weather */}
          <div className="hidden md:flex items-center space-x-2 rounded-full border border-orange-100 bg-orange-50/50 px-3.5 py-1.5 text-xs text-orange-800">
            <CloudSun className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="font-mono font-medium">
              {selectedCity === 'all' ? "N'Djaména" : selectedCity}: {currentWeather.temp}°C
            </span>
            <span className="text-orange-500 font-sans text-[10px] font-semibold">
              ({currentWeather.condition})
            </span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-all border border-gray-100"
              id="lang-selector-btn"
            >
              <Globe className="h-4 w-4" />
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-32 rounded-2xl border border-gray-100 bg-white p-1 shadow-xl z-20">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                      }}
                      className={`w-full text-center rounded-xl px-3 py-1.5 text-xs font-bold ${language === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
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
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                      alt={user.displayName || "User"} 
                      className="h-8 w-8 rounded-full border-2 border-blue-100 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute right-0 mt-2 hidden group-hover:block w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-30">
                      <p className="px-3 py-1.5 text-[10px] text-gray-400 font-semibold truncate border-b border-gray-50">
                        {user.email}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{getTranslation(language, 'signOutBtn')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-none transition-all"
                  id="google-signin-btn"
                >
                  <LogIn className="h-3.5 w-3.5" />
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
