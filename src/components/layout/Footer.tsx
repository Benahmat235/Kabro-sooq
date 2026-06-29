import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MessageCircle, Mail } from 'lucide-react';
import { useLocale } from '../../providers/LocaleProvider';
import { useApp } from '../../context/AppContext';
import { AppRoutes } from '../../router';

export const Footer: React.FC = () => {
  const { t, isRTL } = useLocale();
  const { user } = useApp();
  
  const year = new Date().getFullYear();

  return (
    <footer className="bg-text text-surface pt-12 pb-6 font-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* 1. À propos SooqKabro */}
          <div className="flex flex-col space-y-4">
            <Link to={AppRoutes.HOME} className="inline-block">
              <div className="flex flex-col">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-surface">
                  SooqKabro
                </h2>
                <span className="font-body text-xs text-surface opacity-80 mt-[-2px]">
                  سوق تشاد الكبير
                </span>
              </div>
            </Link>
            <p className="text-sm opacity-90 leading-relaxed">
              La plus grande place de marché en ligne du Tchad. 
              Achetez et vendez facilement, en toute sécurité.
            </p>
            <div className="flex items-center space-x-4 rtl:space-x-reverse pt-2">
              <a href="#" className="text-surface hover:text-accent transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-surface hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-surface hover:text-accent transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 2. Navigation */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-heading text-lg font-bold text-accent">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={AppRoutes.HOME} className="hover:text-accent transition-colors">
                  Catégories populaires
                </Link>
              </li>
              <li>
                <Link to={`${AppRoutes.HOME}#how-it-works`} className="hover:text-accent transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to={`${AppRoutes.HOME}#faq`} className="hover:text-accent transition-colors">
                  FAQ & Aide
                </Link>
              </li>
              <li>
                <Link to={`${AppRoutes.HOME}#security`} className="hover:text-accent transition-colors">
                  Sécurité et confiance
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Mon compte */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-heading text-lg font-bold text-accent">
              Mon compte
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={AppRoutes.POST_AD} className="hover:text-accent transition-colors">
                  Publier une annonce
                </Link>
              </li>
              <li>
                <Link to={AppRoutes.MY_ADS} className="hover:text-accent transition-colors">
                  Mes annonces
                </Link>
              </li>
              <li>
                <Link to={AppRoutes.MESSAGES} className="hover:text-accent transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Link to={AppRoutes.FAVORITES} className="hover:text-accent transition-colors">
                  Favoris
                </Link>
              </li>
              <li>
                <Link to={user ? AppRoutes.PUBLIC_PROFILE.replace(':userId', user.uid) : AppRoutes.MY_PROFILE} className="hover:text-accent transition-colors">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact & Légal */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-heading text-lg font-bold text-accent">
              Contact & Légal
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <MessageCircle className="h-4 w-4 opacity-80" />
                <span dir="ltr">+235 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="h-4 w-4 opacity-80" />
                <span>contact@sooqkabro.td</span>
              </li>
              <li className="pt-2">
                <Link to="/terms" className="hover:text-accent transition-colors opacity-80">
                  Conditions générales d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-accent transition-colors opacity-80">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-surface border-opacity-20 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs opacity-70">
          <p className="mb-2 sm:mb-0">
            &copy; {year} SooqKabro — Marché en ligne du Tchad
          </p>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span>N'Djamena</span>
            <span className="w-1 h-1 rounded-full bg-surface opacity-50"></span>
            <span>Moundou</span>
            <span className="w-1 h-1 rounded-full bg-surface opacity-50"></span>
            <span>Sarh</span>
            <span className="w-1 h-1 rounded-full bg-surface opacity-50"></span>
            <span>Abéché</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
