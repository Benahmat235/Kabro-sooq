import tchadData from './data/tchadData.json';

export type CategoryType = "Véhicules" | "Immobilier" | "Téléphones" | "Emploi" | "Services" | "Animaux";

export type CityType = string;

export type ConditionType = "new" | "excellent" | "good" | "used";

export type ListingStatusType = "active" | "sold" | "archived";

export type LanguageType = "FR" | "AR" | "EN";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: CategoryType;
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
  createdAt: string; // Timestamp or string
  status: ListingStatusType;
  viewsCount: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
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
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  seen?: boolean;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  icon: string;
}

export const isCategoryType = (value: string): value is CategoryType => {
  return ["Véhicules", "Immobilier", "Téléphones", "Emploi", "Services", "Animaux"].includes(value);
};

export const isCityType = (value: string): value is CityType => {
  return tchadData.tchad.regions.map(r => r.chef_lieu).includes(value);
};

export const isConditionType = (value: string): value is ConditionType => {
  return ["new", "excellent", "good", "used"].includes(value);
};

export const isCategoryOrAll = (value: string): value is CategoryType | 'all' => {
  return value === 'all' || isCategoryType(value);
};

export const isConditionOrAll = (value: string): value is ConditionType | 'all' => {
  return value === 'all' || isConditionType(value);
};
