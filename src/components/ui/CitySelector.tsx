import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Search, Check, Globe } from 'lucide-react';
import tchadData from '../../data/tchadData.json';

interface CitySelectorProps {
  selectedCity: string;
  onSelect: (city: string) => void;
  listingCounts?: Record<string, number>;
  totalActiveListings?: number;
  allCitiesLabel?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onSelect,
  listingCounts = {},
  totalActiveListings = 0,
  allCitiesLabel = "Toutes les villes"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regions = useMemo(() => tchadData.tchad.regions, []);
  const ndjamenaArrondissements = useMemo(() => tchadData.tchad.ndjamena?.arrondissements || [], []);

  // Filter cities and arrondissements based on search query
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const matchedCities = regions
      .map(r => ({ ...r, type: 'city' }))
      .filter(r => r.chef_lieu.toLowerCase().includes(query) || r.nom.toLowerCase().includes(query));
      
    const matchedArrondissements = ndjamenaArrondissements
      .map(a => ({ ...a, type: 'arrondissement' }))
      .filter(a => a.nom.toLowerCase().includes(query));
      
    return {
      cities: matchedCities,
      arrondissements: matchedArrondissements
    };
  }, [searchQuery, regions, ndjamenaArrondissements]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Sélectionner la ville de recherche"
        className="flex items-center space-x-1.5 rounded-full bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
        <span className="max-w-[120px] truncate">
          {selectedCity === 'all' ? allCitiesLabel : selectedCity}
        </span>
        <ChevronDown className="h-3 w-3 text-gray-500 shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-gray-100 bg-white shadow-2xl z-20 flex flex-col max-h-[70vh] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-gray-50/30 flex items-center space-x-2 border-b border-gray-100 shrink-0">
            <Search className="h-3.5 w-3.5 text-gray-500 shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher une ville, région, arrondissement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="text-[10px] text-gray-500 hover:text-gray-700 font-black shrink-0"
              >
                Vider
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1">
            {!searchQuery && (
              <button
                onClick={() => {
                  onSelect('all');
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors ${
                  selectedCity === 'all' 
                    ? 'bg-primary-50 text-primary-700 font-bold' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2 font-bold">
                  <Globe className="h-3.5 w-3.5 text-primary-500 shrink-0" aria-hidden="true" />
                  <span>{allCitiesLabel}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="rounded-lg bg-primary-100/50 px-1.5 py-0.5 text-[9px] font-black text-primary-600 font-mono">
                    {totalActiveListings}
                  </span>
                  {selectedCity === 'all' && <Check className="h-3.5 w-3.5 text-primary-600 shrink-0" aria-hidden="true" />}
                </div>
              </button>
            )}

            {filteredData.cities.length > 0 && (
              <>
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Villes & Régions</div>
                {filteredData.cities.map((cityObj) => {
                  const city = cityObj.chef_lieu;
                  const isSelected = selectedCity === city;
                  const count = listingCounts[city] || 0;
                  return (
                    <button
                      key={city}
                      onClick={() => {
                        onSelect(city);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors ${
                        isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{city}</div>
                        <div className="text-[10px] font-medium text-gray-400 mt-0.5">{cityObj.nom}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {count > 0 && (
                          <span className="rounded-lg bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 font-mono">
                            {count}
                          </span>
                        )}
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary-600 shrink-0" aria-hidden="true" />}
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {filteredData.arrondissements.length > 0 && (
              <>
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400 mt-2 border-t border-gray-50">Arrondissements (N'Djaména)</div>
                {filteredData.arrondissements.map((arrondissement) => {
                  const name = arrondissement.nom;
                  const isSelected = selectedCity === name;
                  const count = listingCounts[name] || 0;
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        onSelect(name);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors ${
                        isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold">{name}</div>
                      <div className="flex items-center space-x-2">
                        {count > 0 && (
                          <span className="rounded-lg bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 font-mono">
                            {count}
                          </span>
                        )}
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary-600 shrink-0" aria-hidden="true" />}
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {filteredData.cities.length === 0 && filteredData.arrondissements.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-gray-400 font-medium">
                Aucune ville ou région trouvée
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
