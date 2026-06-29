import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLocale } from '../../providers/LocaleProvider';
import { Search, MapPin, Plus, Menu, User, LogIn, ChevronDown } from 'lucide-react';
import { CATEGORIES, CITIES } from '../../data/mockData';
import { loginWithGoogle } from '../../lib/firebase';
import { AppRoutes } from '../../router';

export const Header: React.FC = () => {
  const { user, loadingAuth, selectedCity, setSelectedCity } = useApp();
  const { t, lang, setLang, isRTL } = useLocale();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${AppRoutes.SEARCH}?q=${encodeURIComponent(searchQuery)}&category=${selectedCat}`);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-secondary text-surface ${
        isScrolled ? 'py-2 shadow-md' : 'py-3 sm:py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* LEFT: Logo & Tagline */}
        <div 
          className="flex items-center cursor-pointer space-x-2 rtl:space-x-reverse"
          onClick={() => navigate(AppRoutes.HOME)}
        >
          <div className="flex flex-col">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-primary">
              SooqKabro
            </h1>
            <span className="font-body text-[10px] sm:text-xs text-accent opacity-80 mt-[-2px]">
              سوق تشاد الكبير
            </span>
          </div>
        </div>

        {/* CENTER: Search Bar (Desktop Only) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-6">
          <form 
            onSubmit={handleSearch}
            className="flex w-full items-center rounded-lg bg-surface border-2 border-transparent focus-within:border-primary transition-all overflow-hidden h-10 shadow-sm"
          >
            {/* Category Dropdown inside Search */}
            <select
              className="bg-transparent text-text font-ui text-sm px-3 py-2 border-r border-gray-300 rtl:border-l rtl:border-r-0 focus:outline-none h-full cursor-pointer w-36 truncate"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="all">{t('allCategoriesShort')}</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent px-4 text-sm text-text font-body focus:outline-none h-full"
            />
            
            <button 
              type="submit"
              className="bg-primary hover:bg-opacity-90 transition-colors h-full px-5 flex items-center justify-center text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* RIGHT: City Selector, Publish CTA & Mobile Icons */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse sm:space-x-5">
          
          {/* Mobile Search Icon */}
          <button 
            className="md:hidden flex items-center justify-center text-surface hover:text-primary transition-colors p-1"
            onClick={() => navigate(AppRoutes.SEARCH)}
          >
            <Search className="h-6 w-6" />
          </button>

          {/* Desktop City Selector */}
          <div className="hidden md:flex items-center relative group cursor-pointer">
            <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm font-ui text-surface hover:text-accent transition-colors">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[100px]">{selectedCity === 'all' ? t('allCities') : selectedCity}</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-48 rounded-md bg-surface text-text shadow-lg overflow-hidden border border-border-color z-50">
              <div 
                className={`px-4 py-2 text-sm hover:bg-surface-hover cursor-pointer ${selectedCity === 'all' ? 'font-bold text-primary' : ''}`}
                onClick={() => setSelectedCity('all')}
              >
                {t('allCities')}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {CITIES.map(city => (
                  <div 
                    key={city}
                    className={`px-4 py-2 text-sm hover:bg-surface-hover cursor-pointer ${selectedCity === city ? 'font-bold text-primary' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="hidden sm:flex items-center justify-center text-xs font-bold text-secondary bg-accent hover:bg-opacity-90 rounded-sm px-2 py-1 transition-colors"
          >
            {lang === 'fr' ? 'AR' : 'FR'}
          </button>

          {/* Auth Button */}
          {!loadingAuth && !user && (
            <button 
              onClick={loginWithGoogle}
              className="hidden sm:flex items-center space-x-1 rtl:space-x-reverse text-sm font-ui text-surface hover:text-primary transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}

          {/* Publish CTA - Always visible */}
          <button 
            onClick={() => navigate(AppRoutes.POST_AD)}
            className="flex items-center space-x-1 rtl:space-x-reverse bg-primary hover:bg-opacity-90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-ui font-semibold text-sm transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('publish')}</span>
          </button>

          {/* User Profile or Mobile Menu Icon */}
          {user ? (
            <button 
              onClick={() => navigate(AppRoutes.PUBLIC_PROFILE.replace(':userId', user.uid))}
              className="flex items-center justify-center rounded-full border border-primary p-0.5 overflow-hidden w-8 h-8 sm:w-9 sm:h-9"
            >
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : (
            <button className="md:hidden flex items-center justify-center text-surface hover:text-primary p-1">
              <Menu className="h-6 w-6" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
