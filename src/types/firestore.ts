import { Timestamp } from 'firebase/firestore';

/**
 * CONSEIL D'OPTIMISATION (Lectures bon marché) :
 * Créez des index composites dans la console Firebase pour les requêtes courantes, par exemple :
 * - ads : category (ASC) + status (ASC) + createdAt (DESC)
 * - ads : city (ASC) + category (ASC) + status (ASC)
 * - ads : sellerId (ASC) + status (ASC)
 */

export type AdStatus = 'draft' | 'pending' | 'active' | 'sold' | 'expired';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface UserDocument {
  /** user ID (Firebase Auth uid) */
  uid: string;
  displayName: string;
  /** Phone number in format +235... */
  phoneNumber: string;
  city: string;
  isVerified: boolean;
  isPremium: boolean;
  rating: number;
  totalRatings: number;
  createdAt: Timestamp;
  lastSeen: Timestamp;
}

export interface AdDocument {
  id: string;
  title: string;
  description: string;
  /** Price in FCFA */
  price: number;
  city: string;
  category: string;
  subCategory?: string;
  images: string[];
  status: AdStatus;
  /** The uid of the seller */
  sellerId: string;
  isFeatured: boolean;
  viewCount: number;
  contactCount: number;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export interface CategoryDocument {
  id: string;
  slug: string;
  label_fr: string;
  label_ar: string;
  icon: string;
  parentId?: string;
  order: number;
  adCount: number;
}

export interface CityDocument {
  id: string;
  name_fr: string;
  name_ar: string;
  region: string;
  lat: number;
  lng: number;
}

export interface ConversationDocument {
  id: string;
  adId: string;
  /** uid of the buyer */
  buyerId: string;
  /** uid of the seller */
  sellerId: string;
  lastMessage: string;
  updatedAt: Timestamp;
  unreadBuyer: number;
  unreadSeller: number;
}

export interface MessageDocument {
  id: string;
  /** uid of the sender */
  senderId: string;
  text: string;
  createdAt: Timestamp;
  isRead: boolean;
}

export interface FavoriteDocument {
  /** Document ID can be `${userId}_${adId}` */
  id?: string;
  /** uid of the user */
  userId: string;
  adId: string;
  addedAt: Timestamp;
}

export interface ReportDocument {
  id?: string;
  adId: string;
  /** uid of the reporter */
  reporterId: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: Timestamp;
}

export interface ReviewDocument {
  id: string;
  /** uid of the reviewer (buyer) */
  reviewerId: string;
  /** uid of the seller */
  sellerId: string;
  adId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}
