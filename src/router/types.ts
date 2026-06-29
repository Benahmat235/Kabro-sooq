import { ComponentType, ReactNode } from 'react';

export enum AppRoutes {
  HOME = '/',
  CATEGORY = '/categorie/:slug',
  SUBCATEGORY = '/categorie/:slug/:sub',
  AD_DETAIL = '/annonce/:id',
  SEARCH = '/recherche',
  POST_AD = '/publier',
  MY_ADS = '/mes-annonces',
  MESSAGES = '/messages',
  CONVERSATION = '/messages/:conversationId',
  FAVORITES = '/favoris',
  PUBLIC_PROFILE = '/profil/:userId',
  MY_PROFILE = '/mon-profil',
}

export interface RouteConfig {
  path: AppRoutes | string;
  component: ComponentType<any>;
  isProtected?: boolean;
}

export interface AuthGuardProps {
  children: ReactNode;
}
