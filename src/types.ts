import tchadData from './data/tchadData.json';

export type ConditionType = "new" | "excellent" | "good" | "used";
export type AdStatusType = "active" | "sold" | "archived" | "out_of_stock";
export type CategoryType = string;
export type CityType = string;
export type LanguageType = "FR" | "AR" | "EN";
export type ListingStatusType = "active" | "sold" | "archived" | "out_of_stock";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: CategoryType;
  subcategory?: string;
  city: CityType;
  arrondissement?: string;
  quartier?: string;
  images: string[];
  condition: ConditionType;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsApp: string;
  sellerIsVerified: boolean;
  sellerResponseTime: string;
  createdAt: string;
  status: ListingStatusType;
  viewsCount: number;
  contactCount?: number;
  renewedAt?: string;
  quantity?: number;
  isPremium?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  isVerified?: boolean;
  loyaltyPoints?: number;
}

export interface FirestoreUserDoc {
  uid: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  savedListings?: string[];
  priceAlerts?: string[];
  followedSellers?: string[];
  fcmTokens?: string[];
  mfaEnabled?: boolean;
  mfaPhone?: string;
  isVerified?: boolean;
  loyaltyPoints?: number;
}

export interface PublicUserProfileDTO {
  uid: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageAt: string;
  participantIds: string[];
  unreadCount?: { [userId: string]: number };
  typing?: { [userId: string]: boolean };
  archivedBy?: string[];
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  icon: string;
}

// ---------------------------------------------------------
// NEW FIRESTORE SCHEMA TYPES
// ---------------------------------------------------------

export interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: number;
  phone?: string;
  isVerified?: boolean;
  loyaltyPoints?: number;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  cityId: string;
  images: string[];
  condition: ConditionType;
  sellerId: string;
  createdAt: number;
  updatedAt: number;
  status: AdStatusType;
  viewsCount: number;
  isPremium?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  order: number;
  subcategories: {
    slug: string;
    name: string;
  }[];
}

export interface City {
  id: string;
  slug: string;
  name: string;
  region?: string;
}

export interface Message {
  id: string;
  chatId?: string;
  senderId: string;
  receiverId?: string;
  text: string;
  adId?: string;
  createdAt: number | string;
  seen?: boolean;
  
  // Backwards compatibility properties for previous implementation
  imageUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  flagged?: boolean;
  flaggedReason?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  adId: string;
  createdAt: number | string;
}

export interface Report {
  id: string;
  reporterId: string;
  adId?: string;
  sellerId?: string;
  reason: 'fraud' | 'counterfeit' | 'inappropriate' | 'wrong_price' | 'other';
  comment: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number | string;

  // Backwards compatibility
  listingId?: string;
  listingTitle?: string;
  listingSellerId?: string;
  listingSellerName?: string;
  reporterName?: string;
}

export interface Review {
  id: string;
  reviewerId?: string;
  sellerId: string;
  adId?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: number | string;
  
  // Backwards compatibility
  sellerName?: string;
  buyerId?: string;
  buyerName?: string;
  buyerAvatarUrl?: string;
  listingId?: string;
  listingTitle?: string;
}

export const isCategoryType = (value: string): value is CategoryType => {
  return typeof value === 'string';
};

export const isCityType = (value: string): value is CityType => {
  return tchadData.tchad.regions.map(r => r.chef_lieu).includes(value);
};

export const isConditionType = (value: string): value is ConditionType => {
  return ["new", "excellent", "good", "used"].includes(value);
};

export const isCategoryOrAll = (value: string): value is CategoryType | 'all' => {
  return typeof value === 'string';
};

export const isConditionOrAll = (value: string): value is ConditionType | 'all' => {
  return value === 'all' || isConditionType(value);
};

