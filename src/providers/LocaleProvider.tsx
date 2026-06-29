import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation } from '../utils/translations';
import { LanguageType } from '../types';

export type Language = 'fr' | 'ar' | 'en';
export type Currency = 'FCFA' | 'XAF';
export type Direction = 'ltr' | 'rtl';

interface LocaleContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  isRTL: boolean;
  t: (key: string) => string;
  formatPrice: (amount: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('sooq_locale');
    if (saved && ['fr', 'ar', 'en'].includes(saved)) {
      return saved as Language;
    }
    return 'fr';
  });

  const currency: Currency = 'FCFA';
  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('sooq_locale', lang);
    const html = document.documentElement;
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);
  }, [lang, isRTL]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: string) => {
    const langUpper = lang.toUpperCase() as LanguageType;
    return getTranslation(langUpper, key);
  };

  const formatPrice = (amount: number): string => {
    const formatted = amount.toLocaleString('fr-FR').replace(/\s/g, ' '); 
    return `${formatted} ${currency}`;
  };

  return (
    <LocaleContext.Provider value={{ lang, setLang, currency, isRTL, t, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
