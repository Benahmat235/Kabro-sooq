import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';

export const Footer: React.FC = () => {
  const { language } = useApp();
  
  return (
    <footer className="mt-12 border-t border-gray-100 bg-white py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs font-bold text-gray-500 mb-2">
          Kabro Sooq &copy; {new Date().getFullYear()} - {getTranslation(language, 'tagline')}
        </p>
        <p className="text-[10px] text-gray-400 font-mono tracking-wider">
          CONÇU AU TCHAD POUR LE TCHAD
        </p>
      </div>
    </footer>
  );
};
