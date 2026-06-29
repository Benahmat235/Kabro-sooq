import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { TCHAD_CATEGORIES } from '../../data/categories';

interface SearchBarProps {
  onSearch: (query: string, category?: string, city?: string) => void;
  defaultQuery?: string;
  defaultCategory?: string;
  compact?: boolean;
}

const PLACEHOLDERS = [
  "Chercher une moto...",
  "Trouver un appartement...",
  "Acheter un téléphone...",
  "Dénicher des pagnes...",
  "Chercher un emploi..."
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  defaultQuery = '',
  defaultCategory = '',
  compact = false,
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [category, setCategory] = useState(defaultCategory);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus automatique depuis l'URL
  useEffect(() => {
    if (window.location.search.includes('focus=search') && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Rotation des placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounce (350ms) et logique de suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 1) {
        // Mock des suggestions adaptées aux intentions
        const mockSuggestions = [
           `${query} occasion`,
           `${query} à N'Djamena`,
           `${query} neuf`,
           `Prix pour ${query}`
        ];
        
        // Détection de catégorie
        const catMatch = TCHAD_CATEGORIES.find(c => 
          c.label.fr.toLowerCase().includes(query.toLowerCase()) || 
          c.subcategories?.some(sub => sub.label.fr.toLowerCase().includes(query.toLowerCase()))
        );

        if (catMatch) {
            mockSuggestions.unshift(`Catégorie : ${catMatch.label.fr}`);
        }

        setSuggestions(mockSuggestions.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fermer les suggestions au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchExecute = (selectedQuery: string, selectedCat: string) => {
    setShowSuggestions(false);
    onSearch(selectedQuery, selectedCat);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) {
          setShowSuggestions(true);
      }
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        const isCat = selected.startsWith('Catégorie : ');
        const text = isCat ? selected.replace('Catégorie : ', '') : selected;
        setQuery(text);
        if (isCat) {
           const match = TCHAD_CATEGORIES.find(c => c.label.fr === text);
           handleSearchExecute(text, match ? match.id : category);
        } else {
           handleSearchExecute(text, category);
        }
      } else {
        handleSearchExecute(query, category);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSearchClick = () => {
    handleSearchExecute(query, category);
  };

  return (
    <div ref={containerRef} className={`w-full max-w-[720px] mx-auto relative ${compact ? 'text-sm' : 'text-base'}`}>
      <div className={`flex flex-col md:flex-row items-stretch border-2 border-[#E8D9C4] focus-within:border-[#C8762B] bg-[#FDF6EC] overflow-hidden ${compact ? 'rounded-xl' : 'rounded-2xl'} transition-colors`}>
        
        {/* Dropdown Catégorie */}
        <div className={`order-2 md:order-1 w-full md:w-56 border-t md:border-t-0 md:border-r border-[#E8D9C4] relative group bg-[#1A1209]`}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full h-full appearance-none bg-transparent text-[#FDF6EC] outline-none cursor-pointer
              ${compact ? 'h-10 px-3' : 'h-12 md:h-14 px-4'} 
              hover:text-[#F0C060] transition-colors focus:ring-0
            `}
            style={{ paddingRight: '2.5rem' }}
          >
            <option value="">Toutes les catégories</option>
            {TCHAD_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label.fr}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#F0C060] pointer-events-none" />
        </div>

        {/* Input + Bouton */}
        <div className="order-1 md:order-2 flex flex-1 items-stretch">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                  if (query.trim().length > 1) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className={`w-full h-full bg-transparent outline-none text-[#1C1008] placeholder:text-[#1C1008]/50 
                ${compact ? 'px-3' : 'px-4'}
              `}
            />
          </div>

          <button
            onClick={handleSearchClick}
            className={`bg-[#C8762B] text-white flex items-center justify-center hover:bg-[#b06522] transition-colors focus:outline-none focus:bg-[#b06522]
              ${compact ? 'w-12' : 'w-14 md:w-16'}
            `}
          >
            <Search className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
          </button>
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className={`absolute z-50 w-full mt-2 bg-[#FDF6EC] border border-[#C8762B] shadow-xl overflow-hidden ${compact ? 'rounded-lg' : 'rounded-xl'}`}>
          {suggestions.map((suggestion, idx) => {
             const isCat = suggestion.startsWith('Catégorie : ');
             const displayText = isCat ? suggestion.replace('Catégorie : ', '') : suggestion;
             return (
              <li
                key={idx}
                className={`px-4 py-3 cursor-pointer border-b last:border-0 border-[#E8D9C4] flex items-center gap-3 transition-colors
                  ${selectedIndex === idx ? 'bg-[#C8762B]/10 text-[#C8762B]' : 'text-[#1C1008] hover:bg-[#E8D9C4]/50'}
                `}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  setQuery(displayText);
                  if (isCat) {
                      const match = TCHAD_CATEGORIES.find(c => c.label.fr === displayText);
                      handleSearchExecute(displayText, match ? match.id : category);
                  } else {
                      handleSearchExecute(displayText, category);
                  }
                }}
              >
                {isCat ? <ChevronDown className="h-4 w-4 text-[#C8762B]" /> : <Search className="h-4 w-4 text-[#1C1008]/40" />}
                <span className={isCat ? 'font-bold text-[#C8762B]' : ''}>{displayText}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
